import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { after, test } from 'node:test';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { POST_IMAGES_DIR } from '../src/config/uploads.js';

process.env.JWT_SECRET = 'connect-sphere-test-secret';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.SMTP_HOST = 'smtp.example.com';
process.env.SMTP_PORT = '587';
process.env.SMTP_USER = 'test-user';
process.env.SMTP_PASSWORD = 'test-password';
process.env.MAIL_FROM = 'ConnectSphere <noreply@example.com>';

const [
  { default: app },
  { default: User },
  { default: Post },
  { default: NotificationStatus },
  { default: Resource },
  { default: DirectMessage },
  { default: Notice },
  { default: Room },
  { default: RoomMessage },
  { default: emailService }
] = await Promise.all([
  import('../src/app.js'),
  import('../src/models/User.js'),
  import('../src/models/Post.js'),
  import('../src/models/NotificationStatus.js'),
  import('../src/models/Resource.js'),
  import('../src/models/DirectMessage.js'),
  import('../src/models/Notice.js'),
  import('../src/models/Room.js'),
  import('../src/models/RoomMessage.js'),
  import('../src/services/emailService.js')
]);

const server = app.listen(0);
await new Promise((resolve) => server.once('listening', resolve));
const baseUrl = `http://127.0.0.1:${server.address().port}`;

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

const student = {
  _id: 'student-id',
  name: 'Test Student',
  handle: 'teststudent',
  email: 'student@example.com',
  role: 'student',
  department: 'Science',
  bio: '',
  avatarUrl: ''
};

function tokenFor(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET);
}

async function request(path, { method = 'GET', token, body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {})
    },
    ...(body ? { body: body instanceof FormData ? body : JSON.stringify(body) } : {})
  });

  return { response, data: await response.json() };
}

function mockAuthenticatedUsers(t, users = [student]) {
  t.mock.method(User, 'findById', (id) => ({
    select: async () => users.find((user) => user._id === id) || null
  }));
}

test('sign-in returns a token and public user details for valid credentials', async (t) => {
  const password = 'correct horse battery staple';
  const passwordHash = await bcrypt.hash(password, 4);
  t.mock.method(User, 'findOne', async (query) => {
    assert.deepEqual(query, { $or: [{ handle: 'teststudent' }, { email: '@teststudent' }] });
    return { ...student, password: passwordHash };
  });

  const invalidCredentials = await request('/api/auth/login', {
    method: 'POST',
    body: { query: '@TestStudent', password: 'incorrect password' }
  });
  assert.equal(invalidCredentials.response.status, 400);
  assert.equal(invalidCredentials.data.message, 'Invalid credentials.');

  const { response, data } = await request('/api/auth/login', {
    method: 'POST',
    body: { query: '@TestStudent', password }
  });

  assert.equal(response.status, 200);
  assert.equal(data.message, 'Login successful');
  assert.equal(typeof data.token, 'string');
  assert.deepEqual(data.user, {
    id: student._id,
    name: student.name,
    handle: student.handle,
    email: student.email,
    role: student.role,
    department: student.department,
    bio: student.bio,
    avatarUrl: student.avatarUrl
  });
  assert.equal('password' in data.user, false);
});

test('students can register with either a registration number or email and sign in with email', async (t) => {
  const createdUsers = [];
  let findOneHandler = async () => null;
  const verificationUrls = [];
  t.mock.method(User, 'findOne', (...args) => findOneHandler(...args));
  t.mock.method(User, 'create', async (fields) => {
    const user = { ...fields, _id: `new-user-${createdUsers.length}`, async save() {} };
    createdUsers.push(user);
    return user;
  });
  t.mock.method(emailService, 'sendVerificationEmail', async (message) => {
    verificationUrls.push(message.verificationUrl);
  });

  const emailRegistration = await request('/api/auth/register', {
    method: 'POST',
    body: {
      name: 'Email Student',
      handle: 'EmailStudent',
      email: ' EMAIL@example.com ',
      password: 'email-password'
    }
  });
  assert.equal(emailRegistration.response.status, 201);
  assert.equal(createdUsers[0].email, 'email@example.com');
  assert.equal(createdUsers[0].handle, 'emailstudent');
  assert.equal('registrationNumber' in createdUsers[0], false);
  assert.equal(createdUsers[0].role, 'student');
  assert.equal(createdUsers[0].emailVerified, false);
  assert.equal(emailRegistration.data.verificationEmailSent, true);
  assert.match(verificationUrls[0], /#verifyEmail=[a-f\d]{64}/);

  const registrationNumberSignup = await request('/api/auth/register', {
    method: 'POST',
    body: {
      name: 'Registration Student',
      handle: 'RegistrationStudent',
      email: 'registration@example.com',
      registrationNumber: ' 2026CS101 ',
      password: 'registration-password'
    }
  });
  assert.equal(registrationNumberSignup.response.status, 201);
  assert.equal(createdUsers[1].registrationNumber, '2026cs101');

  const invalidEmail = await request('/api/auth/register', {
    method: 'POST',
    body: {
      name: 'Invalid Email',
      handle: 'invalidemail',
      email: 'not-an-email',
      password: 'password'
    }
  });
  assert.equal(invalidEmail.response.status, 400);

  const emailPasswordHash = await bcrypt.hash('email-password', 4);
  findOneHandler = async (query) => {
    assert.deepEqual(query, { email: 'email@example.com', role: 'student' });
    return { ...createdUsers[0], password: emailPasswordHash };
  };
  const emailLogin = await request('/api/auth/login', {
    method: 'POST',
    body: { query: 'EMAIL@example.com', password: 'email-password', identifierType: 'email' }
  });
  assert.equal(emailLogin.response.status, 403);
  assert.equal(emailLogin.data.code, 'EMAIL_NOT_VERIFIED');
  assert.equal(emailLogin.data.email, 'email@example.com');

  let verificationQuery;
  t.mock.method(User, 'findOneAndUpdate', async (query, update) => {
    verificationQuery = query;
    assert.equal(update.$set.emailVerified, true);
    assert.equal(update.$unset.emailVerificationTokenHash, 1);
    return { ...createdUsers[0], emailVerified: true };
  });
  const token = new URLSearchParams(new URL(verificationUrls[0]).hash.slice(1)).get('verifyEmail');
  const verified = await request('/api/auth/verify-email', {
    method: 'POST',
    body: { token }
  });
  assert.equal(verified.response.status, 200);
  assert.equal(verified.data.message, 'Email verified. You can now sign in.');
  assert.equal(
    verificationQuery.emailVerificationTokenHash,
    createHash('sha256').update(token).digest('hex')
  );
  assert.ok(verificationQuery.emailVerificationExpires.$gt instanceof Date);

  findOneHandler = async (query) => ({ ...createdUsers[0], password: emailPasswordHash, emailVerified: true });
  const emailLoginAfterVerification = await request('/api/auth/login', {
    method: 'POST',
    body: { query: 'EMAIL@example.com', password: 'email-password', identifierType: 'email' }
  });
  assert.equal(emailLoginAfterVerification.response.status, 200);
  assert.equal(emailLoginAfterVerification.data.user.email, 'email@example.com');

  const resendUser = {
    ...createdUsers[0],
    emailVerified: false,
    emailVerificationSentAt: new Date(Date.now() - 61 * 1000),
    async save() {}
  };
  findOneHandler = async (query) => {
    assert.deepEqual(query, { email: 'email@example.com', role: 'student' });
    return resendUser;
  };
  const resent = await request('/api/auth/resend-verification', {
    method: 'POST',
    body: { email: ' EMAIL@example.com ' }
  });
  assert.equal(resent.response.status, 200);
  assert.equal(verificationUrls.length, 3);
  assert.notEqual(
    new URLSearchParams(new URL(verificationUrls[0]).hash.slice(1)).get('verifyEmail'),
    new URLSearchParams(new URL(verificationUrls[2]).hash.slice(1)).get('verifyEmail')
  );
});

test('posting requires text and returns a created post', async (t) => {
  mockAuthenticatedUsers(t);
  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  const populatedPost = {
    _id: 'post-id',
    text: 'Hello, ConnectSphere!',
    imageUrl: '',
    createdAt,
    author: student,
    comments: []
  };

  t.mock.method(Post, 'create', async (fields) => {
    assert.deepEqual(fields, {
      author: student._id,
      text: 'Hello, ConnectSphere!',
      imageUrl: '',
      imageName: ''
    });
    return { _id: populatedPost._id };
  });
  t.mock.method(Post, 'findById', () => ({
    populate() {
      return this;
    },
    then(resolve, reject) {
      return Promise.resolve(populatedPost).then(resolve, reject);
    }
  }));
  const token = tokenFor(student._id);
  const missingText = await request('/api/posts', {
    method: 'POST',
    token,
    body: { text: '   ' }
  });
  assert.equal(missingText.response.status, 400);
  assert.equal(missingText.data.message, 'Post text is required.');

  const created = await request('/api/posts', {
    method: 'POST',
    token,
    body: { text: '  Hello, ConnectSphere!  ' }
  });
  assert.equal(created.response.status, 201);
  assert.equal(created.data.id, populatedPost._id);
  assert.equal(created.data.text, populatedPost.text);
  assert.equal(created.data.author._id, student._id);
  assert.deepEqual(created.data.comments, []);
});

test('post images upload as files and are served from persistent upload storage', async (t) => {
  mockAuthenticatedUsers(t);
  const imageBytes = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jXioAAAAASUVORK5CYII=',
    'base64'
  );
  let createdFields;
  let populatedPost;

  t.mock.method(Post, 'create', async (fields) => {
    createdFields = fields;
    populatedPost = {
      _id: 'image-post-id',
      text: fields.text,
      imageUrl: fields.imageUrl,
      imageName: fields.imageName,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      author: student
    };
    return { _id: populatedPost._id };
  });
  t.mock.method(Post, 'findById', () => ({
    populate() {
      return this;
    },
    then(resolve, reject) {
      return Promise.resolve(populatedPost).then(resolve, reject);
    }
  }));
  t.mock.method(Post, 'findOne', (query) => ({
    select() {
      assert.equal(query.imageName, createdFields.imageName);
      return Promise.resolve({ _id: populatedPost._id });
    }
  }));

  const form = new FormData();
  form.set('text', 'Post with an image');
  form.set('image', new Blob([imageBytes], { type: 'image/png' }), 'pixel.png');
  const { response, data } = await request('/api/posts', {
    method: 'POST',
    token: tokenFor(student._id),
    body: form
  });

  assert.equal(response.status, 201);
  assert.equal(createdFields.author, student._id);
  assert.equal(createdFields.text, 'Post with an image');
  assert.match(createdFields.imageName, /^[a-f\d-]+\.png$/i);
  assert.equal(data.imageUrl, `/api/posts/images/${createdFields.imageName}`);

  t.after(async () => {
    await unlink(join(POST_IMAGES_DIR, createdFields.imageName));
  });

  const imageResponse = await fetch(`${baseUrl}${data.imageUrl}`, {
    headers: { Authorization: `Bearer ${tokenFor(student._id)}` }
  });
  assert.equal(imageResponse.status, 200);
  assert.deepEqual(Buffer.from(await imageResponse.arrayBuffer()), imageBytes);

  const unauthorizedImage = await fetch(`${baseUrl}${data.imageUrl}`);
  assert.equal(unauthorizedImage.status, 401);

  const invalidImageForm = new FormData();
  invalidImageForm.set('text', 'File with a false image type');
  invalidImageForm.set('image', new Blob(['not a PNG'], { type: 'image/png' }), 'invalid.png');
  const invalidImage = await request('/api/posts', {
    method: 'POST',
    token: tokenFor(student._id),
    body: invalidImageForm
  });
  assert.equal(invalidImage.response.status, 400);
  assert.equal(invalidImage.data.message, 'Uploaded file is not a valid image.');
  assert.equal(createdFields.imageName, new URL(data.imageUrl, baseUrl).pathname.split('/').pop());

  const unsupportedForm = new FormData();
  unsupportedForm.set('text', 'Unsupported image');
  unsupportedForm.set('image', new Blob(['not an image'], { type: 'image/gif' }), 'image.gif');
  const unsupported = await request('/api/posts', {
    method: 'POST',
    token: tokenFor(student._id),
    body: unsupportedForm
  });
  assert.equal(unsupported.response.status, 400);

  const oversizedForm = new FormData();
  oversizedForm.set('text', 'Oversized image');
  oversizedForm.set(
    'image',
    new Blob([Buffer.alloc(5 * 1024 * 1024 + 1)], { type: 'image/png' }),
    'oversized.png'
  );
  const oversized = await request('/api/posts', {
    method: 'POST',
    token: tokenFor(student._id),
    body: oversizedForm
  });
  assert.equal(oversized.response.status, 413);
});

test('comments can be added and only their author can edit or delete them', async (t) => {
  const otherUser = { ...student, _id: 'other-user-id', handle: 'otheruser' };
  mockAuthenticatedUsers(t, [student, otherUser]);

  const comments = [];
  comments.id = (id) => comments.find((comment) => comment._id === id);
  comments.push = (fields) => {
    const comment = {
      _id: 'new-comment-id',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      ...fields,
      async deleteOne() {
        const index = comments.indexOf(this);
        if (index !== -1) {
          comments.splice(index, 1);
        }
      }
    };
    return Array.prototype.push.call(comments, comment);
  };

  const post = {
    _id: 'post-id',
    comments,
    async save() {},
    populate() {
      return Promise.resolve({
        ...this,
        comments: this.comments.map((comment) => ({
          ...comment,
          user: comment.user === student._id ? student : otherUser
        }))
      });
    }
  };
  t.mock.method(Post, 'findById', () => post);

  const ownerToken = tokenFor(student._id);
  const otherToken = tokenFor(otherUser._id);
  const created = await request('/api/posts/post-id/comment', {
    method: 'POST',
    token: ownerToken,
    body: { text: '  First comment  ' }
  });

  assert.equal(created.response.status, 201);
  assert.equal(created.data.id, 'new-comment-id');
  assert.equal(created.data.text, 'First comment');
  assert.equal(created.data.author._id, student._id);

  const commentPath = '/api/posts/post-id/comment/new-comment-id';
  const deniedEdit = await request(commentPath, {
    method: 'PATCH',
    token: otherToken,
    body: { text: 'Edited by someone else' }
  });
  assert.equal(deniedEdit.response.status, 403);
  assert.equal(comments[0].text, 'First comment');

  const deniedDelete = await request(commentPath, {
    method: 'DELETE',
    token: otherToken
  });
  assert.equal(deniedDelete.response.status, 403);
  assert.equal(comments.length, 1);

  const edited = await request(commentPath, {
    method: 'PATCH',
    token: ownerToken,
    body: { text: '  Edited by the author  ' }
  });
  assert.equal(edited.response.status, 200);
  assert.equal(edited.data.text, 'Edited by the author');
  assert.equal(comments[0].text, 'Edited by the author');

  const deleted = await request(commentPath, {
    method: 'DELETE',
    token: ownerToken
  });
  assert.equal(deleted.response.status, 200);
  assert.equal(comments.length, 0);
});

test('notification statuses are private to the signed-in user and can be persisted', async (t) => {
  mockAuthenticatedUsers(t);
  const statuses = [
    { notificationId: 'notice-507f1f77bcf86cd799439011', read: true, dismissed: false }
  ];
  let writeOperations;

  t.mock.method(NotificationStatus, 'find', (query) => {
    assert.equal(query.user, student._id);
    return {
      select() {
        return this;
      },
      lean: async () => statuses
    };
  });
  t.mock.method(NotificationStatus, 'bulkWrite', async (operations) => {
    writeOperations = operations;
  });

  const token = tokenFor(student._id);
  const loaded = await request('/api/notifications', { token });
  assert.equal(loaded.response.status, 200);
  assert.deepEqual(loaded.data, statuses);

  const saved = await request('/api/notifications', {
    method: 'PATCH',
    token,
    body: {
      notificationIds: ['comment-507f1f77bcf86cd799439012'],
      read: true,
      dismissed: true
    }
  });
  assert.equal(saved.response.status, 200);
  assert.equal(writeOperations.length, 1);
  assert.deepEqual(writeOperations[0].updateOne.filter, {
    user: student._id,
    notificationId: 'comment-507f1f77bcf86cd799439012'
  });
  assert.deepEqual(writeOperations[0].updateOne.update.$set, {
    read: true,
    dismissed: true
  });

  const invalid = await request('/api/notifications', {
    method: 'PATCH',
    token,
    body: { notificationIds: ['not-a-valid-notification-id'], read: true }
  });
  assert.equal(invalid.response.status, 400);
});

test('following and connections are authenticated and persist in the user relationships', async (t) => {
  const viewer = {
    ...student,
    _id: '507f1f77bcf86cd799439011',
    following: [],
    connections: []
  };
  const target = {
    ...student,
    _id: '507f1f77bcf86cd799439012',
    handle: 'targetuser',
    followers: []
  };
  const relationshipUpdates = [];

  t.mock.method(User, 'findById', (id) => {
    const user = [viewer, target].find((candidate) => candidate._id === String(id)) || null;
    return {
      select: async () => user,
      session: async () => user,
      then(resolve, reject) {
        return Promise.resolve(user).then(resolve, reject);
      }
    };
  });
  t.mock.method(User, 'find', () => ({
    sort() {
      return this;
    },
    select: async () => [viewer, target]
  }));
  t.mock.method(User, 'startSession', async () => ({
    withTransaction: async (callback) => callback(),
    endSession: async () => {}
  }));
  t.mock.method(User, 'updateOne', async (...args) => {
    relationshipUpdates.push(args);
    const user = [viewer, target].find((candidate) =>
      candidate._id === String(args[0]._id)
    );
    for (const [operator, fields] of Object.entries(args[1])) {
      for (const [field, value] of Object.entries(fields)) {
        user[field] ||= [];
        if (operator === '$addToSet' && !user[field].includes(value)) {
          user[field].push(value);
        }
        if (operator === '$pull') {
          user[field] = user[field].filter((id) => id !== value);
        }
      }
    }
  });

  const token = tokenFor(viewer._id);
  const followPath = `/api/users/${target._id}/follow`;
  const followed = await request(followPath, {
    method: 'PATCH',
    token,
    body: { following: true }
  });
  assert.equal(followed.response.status, 200);
  assert.deepEqual(followed.data, { following: true });
  assert.equal(relationshipUpdates.length, 2);
  assert.deepEqual(relationshipUpdates[0][1], {
    $addToSet: { following: target._id }
  });
  assert.deepEqual(relationshipUpdates[1][1], {
    $addToSet: { followers: viewer._id }
  });
  assert.deepEqual(relationshipUpdates[0][2], { session: relationshipUpdates[1][2].session });
  const usersAfterFollow = await request('/api/users', { token });
  assert.equal(usersAfterFollow.response.status, 200);
  assert.equal(usersAfterFollow.data.find((user) => user.id === target._id).following, true);

  const unfollowed = await request(followPath, {
    method: 'PATCH',
    token,
    body: { following: false }
  });
  assert.equal(unfollowed.response.status, 200);
  assert.deepEqual(relationshipUpdates[2][1], {
    $pull: { following: target._id }
  });
  assert.deepEqual(relationshipUpdates[3][1], {
    $pull: { followers: viewer._id }
  });
  const usersAfterUnfollow = await request('/api/users', { token });
  assert.equal(usersAfterUnfollow.data.find((user) => user.id === target._id).following, false);

  const connected = await request(`/api/users/${target._id}/connection`, {
    method: 'PATCH',
    token,
    body: { connected: true }
  });
  assert.equal(connected.response.status, 200);
  assert.deepEqual(relationshipUpdates[4][1], {
    $addToSet: { connections: target._id }
  });
  const usersAfterConnect = await request('/api/users', { token });
  assert.equal(usersAfterConnect.data.find((user) => user.id === target._id).connected, true);

  const selfFollow = await request(`/api/users/${viewer._id.toUpperCase()}/follow`, {
    method: 'PATCH',
    token,
    body: { following: true }
  });
  assert.equal(selfFollow.response.status, 400);

  const unauthenticated = await request(followPath, {
    method: 'PATCH',
    body: { following: true }
  });
  assert.equal(unauthenticated.response.status, 401);
});

test('account deletion requires the current password and removes only the signed-in account', async (t) => {
  const userId = '507f1f77bcf86cd799439011';
  const passwordHash = await bcrypt.hash('account-password', 4);
  const account = { ...student, _id: userId, password: passwordHash };
  const deletedUsers = [];
  const updateManyCalls = [];
  const deleteManyCalls = [];

  t.mock.method(User, 'findById', () => ({
    select: async () => account
  }));
  t.mock.method(User, 'updateMany', async (...args) => updateManyCalls.push(args));
  t.mock.method(User, 'findByIdAndDelete', async (id) => {
    deletedUsers.push(String(id));
    return account;
  });
  for (const model of [Post, Resource, Room]) {
    t.mock.method(model, 'find', () => ({
      session() {
        return this;
      },
      select: async () => []
    }));
  }
  t.mock.method(User, 'startSession', async () => ({
    withTransaction: async (callback) => callback(),
    endSession: async () => {}
  }));
  t.mock.method(Post, 'updateMany', async (...args) => updateManyCalls.push(args));
  for (const model of [Post, Resource, DirectMessage, NotificationStatus, Notice, RoomMessage]) {
    t.mock.method(model, 'deleteMany', async (...args) => deleteManyCalls.push([model.modelName, ...args]));
  }

  const token = tokenFor(userId);
  const missingPassword = await request('/api/users/me', { method: 'DELETE', token });
  assert.equal(missingPassword.response.status, 400);
  assert.deepEqual(deletedUsers, []);

  const wrongPassword = await request('/api/users/me', {
    method: 'DELETE',
    token,
    body: { password: 'not-the-password' }
  });
  assert.equal(wrongPassword.response.status, 400);
  assert.deepEqual(deletedUsers, []);

  const deleted = await request('/api/users/me', {
    method: 'DELETE',
    token,
    body: { password: 'account-password' }
  });
  assert.equal(deleted.response.status, 200);
  assert.equal(deleted.data.id, userId);
  assert.deepEqual(deletedUsers, [userId]);
  assert.deepEqual(updateManyCalls[0][1], {
    $pull: { following: userId, followers: userId, connections: userId }
  });
  assert.ok(deleteManyCalls.some(([modelName]) => modelName === 'DirectMessage'));
  assert.ok(deleteManyCalls.some(([modelName]) => modelName === 'Resource'));

  const adminRouteDenied = await request(`/api/users/${userId}`, {
    method: 'DELETE',
    token
  });
  assert.equal(adminRouteDenied.response.status, 403);
});

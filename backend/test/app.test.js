import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'connect-sphere-test-secret';

const [
  { default: app },
  { default: User },
  { default: Post },
  { default: NotificationStatus }
] = await Promise.all([
  import('../src/app.js'),
  import('../src/models/User.js'),
  import('../src/models/Post.js'),
  import('../src/models/NotificationStatus.js')
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
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
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
      imageUrl: ''
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

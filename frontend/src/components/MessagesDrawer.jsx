/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useRef } from 'react';
import { MessageSquare, X } from 'lucide-react';
import MessagesView from './MessagesView';

export default function MessagesDrawer({
  isOpen,
  onClose,
  returnFocusRef,
  currentUser,
  users,
  directMessages,
  onSendDirectMessage,
  selectedRecipient,
  setSelectedRecipient
}) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    } else {
      returnFocusRef.current?.focus();
    }
  }, [isOpen, returnFocusRef]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div className={`messages-drawer-layer ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen}>
      <button
        type="button"
        className="messages-drawer-backdrop"
        onClick={onClose}
        tabIndex={isOpen ? 0 : -1}
        aria-label="Close messages"
      />
      <section
        role="dialog"
        aria-modal={isOpen}
        aria-labelledby="messages-drawer-title"
        className={`messages-drawer-panel ${isOpen ? 'is-open' : ''}`}
      >
        <header className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-slate-200 bg-white">
          <h2 id="messages-drawer-title" className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <MessageSquare size={16} className="text-indigo-600" />
            Messages
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close messages"
          >
            <X size={17} />
          </button>
        </header>
        <MessagesView
          currentUser={currentUser}
          users={users}
          directMessages={directMessages}
          onSendDirectMessage={onSendDirectMessage}
          selectedRecipient={selectedRecipient}
          setSelectedRecipient={setSelectedRecipient}
          isDrawer
        />
      </section>
    </div>
  );
}

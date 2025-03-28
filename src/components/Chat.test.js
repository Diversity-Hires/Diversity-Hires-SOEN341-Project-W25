// src/components/Chat.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// Import jest-dom matchers
import '@testing-library/jest-dom/extend-expect';
import Chat from './Chat';
import axios from 'axios';
import Notiflix from 'notiflix';
import { initializeApp } from 'firebase/app';

// Initialize a dummy Firebase app with a properly formatted databaseURL
initializeApp({
  apiKey: 'dummy',
  authDomain: 'dummy',
  databaseURL: 'https://dummy-project.firebaseio.com',
  projectId: 'dummy',
  storageBucket: 'dummy',
  messagingSenderId: 'dummy',
  appId: 'dummy'
});

// Mock axios and Notiflix notifications
jest.mock('axios');
jest.mock('notiflix');

// Mock Bubbles component to avoid p5 errors
jest.mock('../animations/Bubbles', () => () => <div data-testid="bubbles" />);

const dummyServer = { id: '123', name: 'TestUser' };
const dummyMessages = [
  { id: '1', username: 'TestUser', text: 'Hello', timestamp: Date.now() }
];
const dummyCurrentUser = 'CurrentUser';

describe('Chat Component', () => {
  test('renders placeholder when no server is selected', () => {
    render(
      <Chat
        selectedServer={null}
        serverMode={false}
        currentUser={dummyCurrentUser}
        messages={[]}
        isAdmin={false}
        openAddUser={() => {}}
        openRemoveUser={() => {}}
        openChangeRole={() => {}}
        handleMessageSelect={() => {}}
        selectedMessages={[]}  // explicitly pass empty array
        isDeleteMode={false}
        handleDeleteModeToggle={() => {}}
        getUpdatedRoles={() => {}}
        refresh={() => {}}
      />
    );
    // Adjust the expected text to match exactly what your Chat component renders
    expect(screen.getByText(/Select a friend to start chatting with/i)).toBeInTheDocument();
  });

  test('renders header with DM name and status indicator in DM mode', () => {
    const { container } = render(
      <Chat
        selectedServer={dummyServer}
        serverMode={false} // DM mode
        currentUser={dummyCurrentUser}
        messages={dummyMessages}
        isAdmin={false}
        openAddUser={() => {}}
        openRemoveUser={() => {}}
        openChangeRole={() => {}}
        handleMessageSelect={() => {}}
        selectedMessages={[]}  // pass empty array here too
        isDeleteMode={false}
        handleDeleteModeToggle={() => {}}
        getUpdatedRoles={() => {}}
        refresh={() => {}}
      />
    );
    // Narrow the search to the header container to avoid duplicate matches
    const header = container.querySelector('.flex.justify-between');
    expect(header).toHaveTextContent(dummyServer.name);
    // Check that a status dot is rendered (by looking for an element with a title matching a status value)
    expect(header.querySelector('[title*="offline"], [title*="online"], [title*="away"]')).toBeInTheDocument();
  });

  test('sends a message when form is submitted', async () => {
    axios.post.mockResolvedValueOnce({ data: {} });
    render(
      <Chat
        selectedServer={dummyServer}
        serverMode={false}
        currentUser={dummyCurrentUser}
        messages={[]}
        isAdmin={false}
        openAddUser={() => {}}
        openRemoveUser={() => {}}
        openChangeRole={() => {}}
        handleMessageSelect={() => {}}
        selectedMessages={[]}  // explicitly pass as empty array
        isDeleteMode={false}
        handleDeleteModeToggle={() => {}}
        getUpdatedRoles={() => {}}
        refresh={() => {}}
      />
    );
    const input = screen.getByPlaceholderText(/Type a message/i);
    const sendButton = screen.getByRole('button', { name: /Send/i });

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });
  });
});
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useConversationGroups } from '@/hooks/use-conversation-groups';
import { Conversation } from '@/types/chat';

describe('useConversationGroups', () => {
  // Utility function to create a test conversation
  const createConversation = (id: string, title: string, updatedAt: Date, messages: any[] = []): Conversation => ({
    id,
    title,
    messages: messages.map((content, idx) => ({
      id: `msg-${idx}`,
      content: typeof content === 'string' ? content : content.content,
      role: typeof content === 'string' ? 'user' : content.role || 'user',
      conversationId: id,
      createdAt: new Date(updatedAt.getTime() - 1000),
    })),
    createdAt: new Date(updatedAt.getTime() - 1000),
    updatedAt,
  });

  it('should return empty array for empty conversations', () => {
    const { result } = renderHook(() => useConversationGroups([], ''));
    expect(result.current).toEqual([]);
  });

  it('should group conversations by date', () => {
    const now = new Date();
    
    // Create dates for different time periods
    const todayDate = new Date(now);
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const thisWeekDate = new Date(now);
    thisWeekDate.setDate(thisWeekDate.getDate() - 3);
    const thisMonthDate = new Date(now);
    thisMonthDate.setDate(thisMonthDate.getDate() - 15);
    const olderDate = new Date(now);
    olderDate.setDate(olderDate.getDate() - 45);
    
    const conversations = [
      createConversation('1', 'Today Conv', todayDate, ['Hello']),
      createConversation('2', 'Yesterday Conv', yesterdayDate, ['Hi there']),
      createConversation('3', 'This Week Conv', thisWeekDate, ['Testing']),
      createConversation('4', 'This Month Conv', thisMonthDate, ['Monthly message']),
      createConversation('5', 'Older Conv', olderDate, ['Old message']),
    ];
    
    const { result } = renderHook(() => useConversationGroups(conversations, ''));
    
    // Expect 5 groups (Today, Yesterday, This Week, This Month, Older)
    expect(result.current.length).toBe(5);
    expect(result.current[0]!.title).toBe('Today');
    expect(result.current[1]!.title).toBe('Yesterday');
    expect(result.current[2]!.title).toBe('This Week');
    expect(result.current[3]!.title).toBe('This Month');
    expect(result.current[4]!.title).toBe('Older');
    
    // Check the conversations are in the right groups
    expect(result.current[0]!.items[0]!.id).toBe('1');
    expect(result.current[1]!.items[0]!.id).toBe('2');
    expect(result.current[2]!.items[0]!.id).toBe('3');
    expect(result.current[3]!.items[0]!.id).toBe('4');
    expect(result.current[4]!.items[0]!.id).toBe('5');
  });

  it('should filter conversations based on search query', () => {
    const now = new Date();
    
    const conversations = [
      createConversation('1', 'React Testing', now, ['Jest and RTL']),
      createConversation('2', 'Node API', now, ['Express server']),
      createConversation('3', 'Frontend', now, ['React components']),
      createConversation('4', 'Database', now, [{
        content: 'MongoDB setup',
        role: 'assistant'
      }]),
    ];
    
    // Search in title
    const { result: resultTitle } = renderHook(() => 
      useConversationGroups(conversations, 'React')
    );
    
    expect(resultTitle.current[0]!.items.length).toBe(2);
    expect(resultTitle.current[0]!.items[0]!.id).toBe('1');
    expect(resultTitle.current[0]!.items[1]!.id).toBe('3');
    
    // Search in message content
    const { result: resultContent } = renderHook(() => 
      useConversationGroups(conversations, 'MongoDB')
    );
    
    expect(resultContent.current[0]!.items.length).toBe(1);
    expect(resultContent.current[0]!.items[0]!.id).toBe('4');
  });

  it('should sort conversations within groups by updatedAt date in descending order', () => {
    const now = new Date();
    
    const todayDate1 = new Date(now);
    const todayDate2 = new Date(now);
    todayDate2.setHours(todayDate2.getHours() - 2);
    const todayDate3 = new Date(now);
    todayDate3.setHours(todayDate3.getHours() - 4);
    
    const conversations = [
      createConversation('1', 'Oldest Today', todayDate3, ['Message']),
      createConversation('2', 'Middle Today', todayDate2, ['Message']),
      createConversation('3', 'Newest Today', todayDate1, ['Message']),
    ];
    
    const { result } = renderHook(() => useConversationGroups(conversations, ''));
    
    // Should have one group (Today)
    expect(result.current.length).toBe(1);
    expect(result.current[0]!.title).toBe('Today');
    
    // Items should be sorted newest to oldest
    expect(result.current[0]!.items[0]!.id).toBe('3');
    expect(result.current[0]!.items[1]!.id).toBe('2');
    expect(result.current[0]!.items[2]!.id).toBe('1');
  });
}); 
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '@/redux/slices/authSlice';
import { MessageCircle, X, Send, Trash2, Bot, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/config/api';

interface Message {
  role: 'user' | 'model';
  text: string;
  ts: number;
}

const SYSTEM_PROMPT = `Bạn là trợ lý tư vấn AI của nền tảng học trực tuyến EduPlatform (tương tự Udemy).
Nhiệm vụ của bạn:
- Tư vấn học viên về các khóa học, lộ trình học, phương pháp học hiệu quả
- Giải đáp thắc mắc về tính năng của nền tảng (mua khóa học, thanh toán, chứng chỉ, v.v.)
- Hỗ trợ kỹ thuật cơ bản (không xem được video, lỗi đăng nhập, v.v.)
- Gợi ý khóa học phù hợp theo mục tiêu học viên

Quy tắc:
- Trả lời bằng tiếng Việt, thân thiện, ngắn gọn (tối đa 3–4 câu mỗi lượt)
- Không bịa đặt tên khóa học cụ thể, nếu không chắc hãy hướng dẫn học viên tự tìm kiếm
- Không tư vấn các chủ đề ngoài phạm vi học tập và nền tảng
- Nếu vấn đề phức tạp, hướng dẫn liên hệ support@eduplatform.vn`;

async function callAI(history: Message[], userText: string): Promise<string> {
  const contents = [
    { role: 'user',  parts: [{ text: SYSTEM_PROMPT }] },
    { role: 'model', parts: [{ text: 'Xin chào! Tôi là trợ lý AI của LearnHub. Tôi có thể giúp gì cho bạn?' }] },
    ...history.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    { role: 'user',  parts: [{ text: userText }] },
  ];

  const res = await axiosInstance.post<{ text?: string; error?: string }>('/ai/chat', {
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
  });

  if (res.data.error) throw new Error(res.data.error);
  return res.data.text ?? 'Xin lỗi, tôi không hiểu câu hỏi này.';
}

function storageKey(userId: string) {
  return `chat_history_${userId}`;
}

function loadHistory(userId: string): Message[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(userId: string, messages: Message[]) {
  const trimmed = messages.slice(-100);
  localStorage.setItem(storageKey(userId), JSON.stringify(trimmed));
}

function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
          <Bot size={14} className="text-primary-foreground" />
        </div>
      )}
      <div
        className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted text-foreground rounded-bl-sm'
        }`}
      >
        {msg.text}
      </div>
    </div>
  );
}

export default function AIChatBox() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  const userId = user?._id ?? user?.id ?? user?.username ?? 'guest';

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthenticated && userId) {
      setMessages(loadHistory(userId));
    }
  }, [userId, isAuthenticated]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  if (!isAuthenticated) return null;

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', text, ts: Date.now() };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    saveHistory(userId, newHistory);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const reply = await callAI(messages, text);
      const botMsg: Message = { role: 'model', text: reply, ts: Date.now() };
      const finalHistory = [...newHistory, botMsg];
      setMessages(finalHistory);
      saveHistory(userId, finalHistory);
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    localStorage.removeItem(storageKey(userId));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="Mở chat tư vấn"
        >
          <MessageCircle size={26} />
        </button>
      )}

      {open && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl shadow-2xl border border-border bg-background"
          style={{ width: 360, height: 520 }}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground rounded-t-2xl shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div>
                <p className="font-semibold text-sm leading-tight">Trợ lý AI · LearnHub</p>
                <p className="text-xs opacity-75">Nền tảng học tập trực tuyến</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                className="p-1.5 rounded-lg hover:bg-primary-foreground/20 transition-colors"
                title="Xóa lịch sử chat"
              >
                <Trash2 size={15} />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-primary-foreground/20 transition-colors"
                title="Thu nhỏ"
              >
                <ChevronDown size={15} />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-primary-foreground/20 transition-colors"
                title="Đóng"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm mt-8 space-y-2">
                <Bot size={36} className="mx-auto opacity-30" />
                <p className="font-medium">Xin chào, {user?.name || 'bạn'}! 👋</p>
                <p className="text-xs opacity-70">
                  Tôi có thể tư vấn về khóa học,<br />lộ trình học và hỗ trợ kỹ thuật.
                </p>
                <div className="flex flex-col gap-2 mt-4">
                  {[
                    'Làm thế nào để mua khóa học?',
                    'Tôi nên học gì để trở thành lập trình viên?',
                    'Chứng chỉ có giá trị không?',
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => { setInput(q); inputRef.current?.focus(); }}
                      className="text-xs px-3 py-2 rounded-xl border border-border bg-muted hover:bg-accent transition-colors text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <Bubble key={i} msg={msg} />
            ))}

            {loading && (
              <div className="flex gap-2 items-end">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-primary-foreground" />
                </div>
                <div className="bg-muted px-3 py-2 rounded-2xl rounded-bl-sm">
                  <Loader2 size={16} className="animate-spin text-muted-foreground" />
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-destructive text-center bg-destructive/10 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="px-3 pb-3 pt-2 border-t border-border shrink-0">
            <div className="flex gap-2 items-center bg-muted rounded-xl px-3 py-1.5">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu hỏi..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                disabled={loading}
                maxLength={500}
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 shrink-0 text-primary disabled:opacity-40"
                onClick={handleSend}
                disabled={!input.trim() || loading}
              >
                <Send size={15} />
              </Button>
            </div>
            {/* <p className="text-[10px] text-muted-foreground text-center mt-1.5 opacity-60">
              AI có thể mắc lỗi · Enter để gửi
            </p> */}
          </div>
        </div>
      )}
    </>
  );
}
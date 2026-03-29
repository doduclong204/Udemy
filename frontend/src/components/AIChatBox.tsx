import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { selectIsAuthenticated, selectUser } from '@/redux/slices/authSlice';
import { MessageCircle, X, Send, Trash2, Bot, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/config/api';

interface CourseCard {
  id: string;
  title: string;
  thumbnail: string;
  price: number;
  discountPrice?: number;
}

interface Message {
  role: 'user' | 'model';
  text: string;
  ts: number;
  courseCards?: CourseCard[];
}

const SYSTEM_PROMPT = `Bạn là trợ lý tư vấn AI của nền tảng học trực tuyến LearnHub (tương tự Udemy).
Nhiệm vụ của bạn:
- Tư vấn học viên về các khóa học, lộ trình học, phương pháp học hiệu quả
- Giải đáp thắc mắc về tính năng của nền tảng (mua khóa học, thanh toán, v.v.)
- Hỗ trợ kỹ thuật cơ bản (không xem được video, lỗi đăng nhập, v.v.)
- Gợi ý khóa học phù hợp theo mục tiêu học viên

Quy tắc:
- Trả lời bằng tiếng Việt, thân thiện, ngắn gọn (tối đa 3–4 câu mỗi lượt)
- Chỉ gợi ý đúng các khóa học có trong danh sách được cung cấp, không bịa đặt
- Nền tảng KHÔNG cấp chứng chỉ, không đề cập hoặc hứa hẹn về chứng chỉ
- Không tư vấn các chủ đề ngoài phạm vi học tập và nền tảng
- Nếu vấn đề phức tạp, hướng dẫn liên hệ support@learnhub.vn
- Khi gợi ý khóa học: chọn TỐI ĐA 3 khóa nổi bật nhất (ưu tiên khóa có outstanding=true) phù hợp với yêu cầu. Thêm JSON ở CUỐI response, KHÔNG thêm ký tự nào khác xung quanh:
  COURSE_CARDS:[{"id":"...","title":"...","thumbnail":"...","price":123456,"discountPrice":99000}]
  (bỏ discountPrice nếu không có giảm giá)`;

const QUICK_PROMPTS = [
  'Làm thế nào để mua khóa học?',
  'Tôi nên học gì để trở thành lập trình viên?',
  'Có những khóa học nào đang giảm giá?',
];

async function callAI(
  history: Message[],
  userText: string
): Promise<{ text: string; courseCards?: CourseCard[] }> {
  const contents = [
    { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
    {
      role: 'model',
      parts: [{ text: 'Xin chào! Tôi là trợ lý AI của LearnHub. Tôi có thể giúp gì cho bạn?' }],
    },
    ...history.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    { role: 'user', parts: [{ text: userText }] },
  ];

  const res = await axiosInstance.post('/ai/chat', {
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
  });

  const result = res.data.data;
  if (result.error) throw new Error(result.error);

  const raw: string = result.text ?? 'Xin lỗi, tôi không hiểu câu hỏi này.';

  const match = raw.match(/COURSE_CARDS:(\[[\s\S]*?\])/);
  let courseCards: CourseCard[] | undefined;
  if (match) {
    try {
      courseCards = JSON.parse(match[1]);
    } catch {
      courseCards = undefined;
    }
  }

  const text = raw.replace(/COURSE_CARDS:\[[\s\S]*?\]/, '').trim();
  return { text, courseCards };
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
  localStorage.setItem(storageKey(userId), JSON.stringify(messages.slice(-100)));
}

function CourseCardList({ cards }: { cards: CourseCard[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2 mt-1 w-full">
      {cards.map((c) => {
        const isHovered = hoveredId === c.id;
        return (
          <a
            key={c.id}
            href={`/course/${c.id}`}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHoveredId(c.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="group flex gap-3 rounded-xl border border-border bg-background p-2 no-underline transition-all duration-200"
            style={{
              boxShadow: isHovered
                ? '0 4px 16px rgba(0,0,0,0.10)'
                : '0 1px 3px rgba(0,0,0,0.04)',
              transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
              borderColor: isHovered ? 'hsl(var(--primary) / 0.4)' : undefined,
            }}
          >
            {/* Thumbnail */}
            <div className="relative shrink-0 w-16 h-12 rounded-lg overflow-hidden bg-muted">
              <img
                src={c.thumbnail}
                alt={c.title}
                className="w-full h-full object-cover transition-transform duration-200"
                style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
              />
            </div>

            {/* Info */}
            <div className="flex flex-col justify-between min-w-0 flex-1 py-0.5">
              <p
                className="text-xs font-semibold leading-tight line-clamp-2 text-foreground transition-colors duration-200"
                style={{ color: isHovered ? 'hsl(var(--primary))' : undefined }}
              >
                {c.title}
              </p>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-primary">
                    {c.discountPrice != null
                      ? `${Number(c.discountPrice).toLocaleString('vi-VN')}đ`
                      : `${Number(c.price).toLocaleString('vi-VN')}đ`}
                  </span>
                  {c.discountPrice != null && (
                    <span className="text-[10px] line-through text-muted-foreground font-normal">
                      {Number(c.price).toLocaleString('vi-VN')}đ
                    </span>
                  )}
                </div>
                <ExternalLink
                  size={11}
                  className="shrink-0 text-muted-foreground transition-colors duration-200"
                  style={{ color: isHovered ? 'hsl(var(--primary))' : undefined }}
                />
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
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
      <div className={`flex flex-col max-w-[78%] gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-muted text-foreground rounded-bl-sm'
          }`}
        >
          {msg.text}
        </div>
        {!isUser && msg.courseCards && msg.courseCards.length > 0 && (
          <CourseCardList cards={msg.courseCards} />
        )}
      </div>
    </div>
  );
}

const PANEL_W = 360;
const PANEL_H = 520;
const BTN_SIZE = 56;

export default function AIChatBox() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const location = useLocation();

  const isAdmin = location.pathname.startsWith('/admin');
  const userId = user?._id ?? user?.id ?? user?.username ?? 'guest';

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pos, setPos] = useState({ x: 24, y: 24 });

  const dragging = useRef(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });
  const hasDragged = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthenticated && userId) setMessages(loadHistory(userId));
  }, [userId, isAuthenticated]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    dragging.current = true;
    hasDragged.current = false;
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, posX: pos.x, posY: pos.y };

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const dx = ev.clientX - dragStart.current.mouseX;
      const dy = ev.clientY - dragStart.current.mouseY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged.current = true;
      const w = open ? PANEL_W : BTN_SIZE;
      const h = open ? PANEL_H : BTN_SIZE;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - w, dragStart.current.posX - dx)),
        y: Math.max(0, Math.min(window.innerHeight - h, dragStart.current.posY - dy)),
      });
    };

    const onUp = () => {
      dragging.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleToggle = () => { if (!hasDragged.current) setOpen((v) => !v); };

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
      const { text: replyText, courseCards } = await callAI(messages, text);
      const botMsg: Message = { role: 'model', text: replyText, courseCards, ts: Date.now() };
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
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  if (!isAuthenticated || isAdmin) return null;

  const posStyle: React.CSSProperties = { position: 'fixed', right: pos.x, bottom: pos.y, zIndex: 50 };

  return (
    <>
      {!open && (
        <button
          style={posStyle}
          onMouseDown={onMouseDown}
          onClick={handleToggle}
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform select-none cursor-grab active:cursor-grabbing"
          aria-label="Mở chat tư vấn"
        >
          <MessageCircle size={26} />
        </button>
      )}

      {open && (
        <div
          style={{ ...posStyle, width: PANEL_W, height: PANEL_H }}
          className="flex flex-col rounded-2xl shadow-2xl border border-border bg-background overflow-hidden"
        >
          {/* Header */}
          <div
            onMouseDown={onMouseDown}
            onClick={handleToggle}
            className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground shrink-0 select-none cursor-grab active:cursor-grabbing"
          >
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
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); handleClear(); }}
                className="p-1.5 rounded-lg hover:bg-primary-foreground/20 transition-colors"
                title="Xóa lịch sử chat"
              >
                <Trash2 size={15} />
              </button>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); setOpen(false); }}
                className="p-1.5 rounded-lg hover:bg-primary-foreground/20 transition-colors"
                title="Đóng"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm mt-6 space-y-3 px-2">
                <Bot size={36} className="mx-auto opacity-30" />
                <p className="font-medium">Xin chào, {user?.name || 'bạn'}! 👋</p>
                <p className="text-xs opacity-70">
                  Tôi có thể tư vấn về khóa học,<br />lộ trình học và hỗ trợ kỹ thuật.
                </p>
                <div className="flex flex-col gap-2 mt-2">
                  {QUICK_PROMPTS.map((q) => (
                    <button
                      key={q}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => { setInput(q); inputRef.current?.focus(); }}
                      className="text-xs px-3 py-2 rounded-xl border border-border bg-muted hover:bg-accent transition-colors text-left w-full"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => <Bubble key={i} msg={msg} />)}

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

          {/* Input */}
          <div
            onMouseDown={(e) => e.stopPropagation()}
            className="px-3 pb-3 pt-2 border-t border-border shrink-0"
          >
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
          </div>
        </div>
      )}
    </>
  );
}
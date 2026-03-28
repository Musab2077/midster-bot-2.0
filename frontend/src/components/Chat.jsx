import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import NavBar, { NavBarItem } from "./NavBar";
import SideBar, { SideBarItems, SideBarSavedChat } from "./SideBar";
import { HiOutlineBars3 } from "react-icons/hi2";
import Responses, { ResponseItems } from "./Responses";
import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";
import { RxCross2 } from "react-icons/rx";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import axios from "axios";

const API = "http://127.0.0.1:8000";
const YT_REGEX =
  /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=[\w-]+|youtu\.be\/[\w-]+))/g;

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  return m ? m[1] : null;
}

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export default function Chat() {
  const navigate = useNavigate();

  const { videoId: urlVideoId, chatId: urlChatId } = useParams();
  const currentChatId = Number(urlChatId) || 0;
  const currentVideoId = urlVideoId || null;

  const [isMd, setIsMd] = useState(window.innerWidth > 845);
  const [sideExpanded, setSideExpanded] = useState(true);
  const [overlaySideBar, setOverlaySideBar] = useState(false);
  const [messages, setMessages] = useState("");
  const [responses, setResponses] = useState([]);
  const [sideButtons, setSideButtons] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [inputResponse, setInputResponse] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const floatingVideoUrl = currentVideoId
    ? `https://www.youtube.com/embed/${currentVideoId}`
    : null;

  const [dragPos, setDragPos] = useState({ x: window.innerWidth - 370, y: 70 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Responsive
  useEffect(() => {
    const fn = () => setIsMd(window.innerWidth > 845);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // Drag logic
  const startDrag = useCallback(
    (e) => {
      setIsDragging(true);
      dragOffset.current = {
        x: e.clientX - dragPos.x,
        y: e.clientY - dragPos.y,
      };
    },
    [dragPos],
  );

  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging) return;
      setDragPos({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging]);

  useEffect(() => {
    setDragPos({ x: window.innerWidth - 370, y: 70 });
  }, [currentVideoId]);

  const handleLogOut = () => {
    localStorage.removeItem("token");
    navigate("/auth");
    toast.success("Logged out successfully");
  };

  const handleBrandClick = () => {
    setSideExpanded(false);
    setOverlaySideBar(false);
    navigate("/");
  };

  const handleSubmit = async (msg) => {
    if (!msg?.trim()) return;
    const matches = msg.match(YT_REGEX);

    try {
      setResponses((prev) => [...prev, { human: msg, bot: "..." }]);

      // New chat — must start with exactly one YouTube URL
      if (currentChatId === 0) {
        if (!matches || matches.length !== 1) {
          toast.error("Send exactly one YouTube URL to start a chat");
          setResponses((prev) => prev.slice(0, -1));
          return;
        }
        setIsLoading(true);
        const vidId = getYouTubeId(matches[0]);
        const { data } = await axios.post(
          `${API}/new_chat`,
          { url: matches[0] },
          { headers: authHeaders() },
        );
        setResponses((prev) => [
          ...prev.slice(0, -1),
          {
            human: msg,
            bot: "✅ YouTube video processed! Ask me anything about it.",
          },
        ]);
        setIsLoading(false);
        navigate(`/chat/${vidId}/${data.thread_id}`);
        return;
      }

      // Existing chat — no YouTube URLs allowed
      if (matches) {
        toast.error("You can't send a YouTube URL in an existing chat");
        setResponses((prev) => prev.slice(0, -1));
        return;
      }

      setIsLoading(true);

      const { data } = await axios.post(
        `${API}/chat`,
        { message: msg, chat_id: currentChatId },
        { headers: authHeaders() },
      );

      setIsLoading(false);
      setResponses((prev) => [
        ...prev.slice(0, -1),
        { human: msg, bot: data.response },
      ]);
      setMessages("");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
      setResponses((prev) => prev.slice(0, -1));
      setIsLoading(false);
    }
  };

  const handleTextArea = (e) => setMessages(e.target.value);

  // Load sidebar threads
  useEffect(() => {
    let alive = true;
    axios
      .get(`${API}/threads`, { headers: authHeaders() })
      .then(({ data }) => {
        if (alive) setSideButtons(data || []);
      })
      .catch(() => {
        if (alive) setSideButtons([]);
      });
    return () => {
      alive = false;
    };
  }, [urlChatId]);

  const handleSavedChat = (id, videoId) => {
    setActiveChatId(id);
    setInputResponse(false);
    setOverlaySideBar(false);
    setResponses([]);
    navigate(`/chat/${videoId}/${id}`);
  };

  const handleNewChat = () => {
    setResponses([]);
    setMessages("");
    setInputResponse(true);
    setActiveChatId(null);
    navigate("/");
  };

  const handleDelete = (id) => {
    axios.delete(`${API}/deleting_chat/${id}`).catch(console.error);
    setSideButtons((prev) => prev.filter((item) => item.chat_id !== id));
    if (activeChatId === id) handleNewChat();
  };

  // Fetch chat history whenever URL params change
  useEffect(() => {
    if (currentChatId !== 0) {
      setActiveChatId(currentChatId);
      setInputResponse(false);
      setResponses([]); // clear first so old messages don't flash
      setMessages("");

      axios
        .get(`${API}/chat/${currentChatId}`, {
          headers: { "Content-Type": "application/json", ...authHeaders() },
        })
        .then(({ data }) => {
          // Backend returns: { response: [{ role: "human"|"bot", message: "..." }] }
          // Pair them up into { human, bot } objects for rendering
          const raw = data.response || [];
          const paired = [];
          for (let i = 0; i < raw.length; i += 2) {
            const humanEntry = raw[i];
            const botEntry = raw[i + 1];
            paired.push({
              human: humanEntry?.role === "human" ? humanEntry.message : "",
              bot: botEntry?.role === "bot" ? botEntry.message : "",
            });
          }
          setResponses(paired);
        })
        .catch((err) => {
          console.error("Failed to load chat:", err);
          navigate("/");
          toast.error("Could not load chat");
        });
    } else {
      // No chatId in URL → new chat state
      setResponses([]);
      setMessages("");
      setInputResponse(true);
      setActiveChatId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlChatId, urlVideoId]);

  const ChatList = () => (
    <>
      {sideButtons.map((e, idx) => {
        const videoId = getYouTubeId(e.url);
        return (
          <div
            key={e.id || idx}
            className={`group flex items-center justify-between rounded-xl px-2.5 py-2 transition-colors duration-150 ${
              activeChatId === e.id
                ? "bg-indigo-500/15"
                : "hover:bg-white/[0.07]"
            }`}
          >
            <div className="flex-1 min-w-0">
              <SideBarSavedChat
                savedChat={videoId}
                videoId={videoId}
                onClick={(vid) => handleSavedChat(e.id, vid)}
              />
            </div>
            <button
              className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-white/30 hover:text-red-400 transition-all p-0.5 rounded ml-1"
              onClick={(ev) => {
                ev.stopPropagation();
                handleDelete(e.id);
              }}
              aria-label="Delete chat"
            >
              <RxCross2 size={12} />
            </button>
          </div>
        );
      })}
    </>
  );

  const BrandLink = () => (
    <button
      onClick={handleBrandClick}
      className="text-base font-semibold bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent tracking-tight px-1 select-none hover:opacity-80 transition-opacity"
    >
      MidsterBot
    </button>
  );

  return (
    <div className="flex h-screen bg-[#07080f] text-white overflow-hidden">
      {/* Mobile overlay sidebar */}
      {overlaySideBar && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          onClick={() => setOverlaySideBar(false)}
        >
          <div
            className="absolute inset-y-0 left-0 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <SideBar
              designing="fixed top-0 bottom-0 left-0 z-50"
              iconResponse={true}
            >
              <div className="flex items-center justify-between mb-1">
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-all"
                  onClick={handleNewChat}
                  title="New chat"
                >
                  <IoChatboxEllipsesOutline size={17} />
                </button>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-all"
                  onClick={() => setOverlaySideBar(false)}
                >
                  <RxCross2 size={17} />
                </button>
              </div>
              <div>
                <ChatList />
              </div>
            </SideBar>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      {isMd && (
        <SideBar iconResponse={sideExpanded}>
          <div
            className={`flex items-center mb-1 ${sideExpanded ? "justify-between" : "justify-center"}`}
          >
            {sideExpanded && (
              <button
                className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-all"
                onClick={handleNewChat}
                title="New chat"
              >
                <IoChatboxEllipsesOutline size={17} />
              </button>
            )}
            <button
              className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-all"
              onClick={() => setSideExpanded((v) => !v)}
              title="Toggle sidebar"
            >
              <SideBarItems
                expanding={
                  sideExpanded ? (
                    <GoSidebarExpand size={17} />
                  ) : (
                    <GoSidebarCollapse size={17} />
                  )
                }
              />
            </button>
          </div>
          <div>{sideExpanded && <ChatList />}</div>
        </SideBar>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <NavBar>
          {!isMd ? (
            <NavBarItem
              context={<BrandLink />}
              icon={
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-all"
                  onClick={() => setOverlaySideBar(true)}
                >
                  <HiOutlineBars3 size={20} />
                </button>
              }
            />
          ) : (
            <NavBarItem context={<BrandLink />} logOutFuction={handleLogOut} />
          )}
        </NavBar>

        {/* Floating draggable video */}
        {floatingVideoUrl && (
          <div
            className="fixed z-[999] w-[340px] rounded-2xl overflow-hidden bg-[#0d0e1a] border border-white/10 shadow-2xl cursor-move select-none"
            style={{ top: dragPos.y, left: dragPos.x }}
            onMouseDown={startDrag}
          >
            <div className="flex items-center justify-between px-3 py-2 bg-white/[0.04] border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#EF4444">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/35">
                  Now Playing
                </span>
              </div>
              <button
                onClick={handleNewChat}
                className="text-white/30 hover:text-red-400 transition-colors p-0.5 rounded"
              >
                <RxCross2 size={13} />
              </button>
            </div>
            <iframe
              className="w-full h-[192px] block pointer-events-auto"
              src={floatingVideoUrl}
              allowFullScreen
              frameBorder="0"
              title="YouTube Video"
            />
          </div>
        )}

        <Responses
          isNewChat={currentChatId === 0}
          inputResponse={inputResponse}
          isLoading={isLoading}
          onSendMessage={handleSubmit}
          handleTextArea={handleTextArea}
        >
          {/* Always render responses directly — no chatResponse gate */}
          {responses.map((r, i) => (
            <ResponseItems key={i} item={i} humanMsg={r.human} botMsg={r.bot} />
          ))}
        </Responses>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import NavBar, { NavBarItem } from "./NavBar";
import SideBar, { SideBarItems, SideBarSavedChat } from "./SideBar";
import "react-toastify/dist/ReactToastify.css";
import { HiOutlineBars3 } from "react-icons/hi2";
import Responses, { ResponseItems } from "./Responses";
import "./scrollbar.css";
import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";
import { RxCross2 } from "react-icons/rx";
import axios from "axios";
import { IoChatboxEllipsesOutline } from "react-icons/io5";

export default function Chat(props) {
  const navigate = useNavigate();

  const [mdDevices, setMdDevices] = useState(window.innerWidth > 845);
  const [iconResponse, setIconResponse] = useState(true);
  const [messages, setMessages] = useState("");
  const [responses, setResponses] = useState([]); // { human, bot }
  const [chatResponse, setChatResponse] = useState(false);
  const [chatId, setChatId] = useState(0);
  const [sideButtons, setSideButtons] = useState([]);
  const [overlaySideBar, setOverlaySideBar] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [inputResponse, setInputResponse] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // floating draggable video (single source of truth)
  const [fixedVideoUrl, setFixedVideoUrl] = useState(null);
  const [dragPos, setDragPos] = useState({ x: window.innerWidth - 360, y: 70 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const divRef = useRef();
  const { chatIds = 0 } = useParams();
  const backendUrl = "http://127.0.0.1:8000";

  // Drag handlers
  const startDrag = (e) => {
    setIsDragging(true);
    setOffset({ x: e.clientX - dragPos.x, y: e.clientY - dragPos.y });
  };
  const onDrag = (e) => {
    if (!isDragging) return;
    setDragPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const stopDrag = () => setIsDragging(false);

  useEffect(() => {
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", stopDrag);
    return () => {
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", stopDrag);
    };
  });

  const handleLogOut = () => {
    localStorage.removeItem("token");
    navigate("/auth");
    toast.success("Logged out successfully");
  };

  // Helper to extract youtube id for sidebar display only
  function getYouTubeId(url) {
    if (!url) return null;
    const regex =
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  // Submit message (either start new chat with a single YouTube URL, or continue existing chat)
  const handleSubmit = async () => {
    if (!messages.trim()) return;

    const youtubeRegex =
      /(https?:\/\/(?:www\.)?(youtube\.com\/watch\?v=[\w-]+|youtu\.be\/[\w-]+))/g;
    const matches = messages.match(youtubeRegex);

    try {
      // Optimistic UI
      setResponses((prev) => [...prev, { human: messages, bot: "..." }]);

      // 🔴 NEW CHAT (chatIds === 0)
      console.log(matches)
      if (Number(chatIds) === 0) {
        if (!matches || matches.length !== 1) {
          toast.error("Send EXACTLY ONE YouTube URL to start chat");
          setResponses((prev) => prev.slice(0, -1));
          return;
        }

        // 🔴 START LOADING
        setIsLoading(true);

        const res = await axios.post(
          `${backendUrl}/new_chat`,
          { url: matches[0] },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const newChatId = res.data.thread_id;

        setResponses((prev) => [
          ...prev.slice(0, -1),
          { human: messages, bot: "YouTube processed successfully" },
        ]);

        setMessages("");
        setIsLoading(false); // 🔴 STOP LOADING
        navigate(`/chat/${newChatId}`);
        return;
      }

      // EXISTING CHAT
      if (matches) {
        toast.error("You cannot send a YouTube URL in an existing chat");
        setResponses((prev) => prev.slice(0, -1));
        return;
      }

      const res = await axios.post(
        `${backendUrl}/chat`,
        { message: messages, chat_id: Number(chatIds) },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setResponses((prev) => [
        ...prev.slice(0, -1),
        { human: messages, bot: res.data.response },
      ]);

      setMessages("");
      setChatResponse(true);
    } catch (err) {
      console.error(err);
      toast.error("Error occurred");
      setResponses((prev) => prev.slice(0, -1));
      setIsLoading(false); // 🔴 ensure loading stops on error
    }
  };

  const handleTextArea = (e) => setMessages(e.target.value);

  // Load all threads for sidebar
  useEffect(() => {
    let isMounted = true;
    const loadingChats = async () => {
      try {
        const response = await axios.get(`${backendUrl}/threads`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (isMounted) setSideButtons(response.data || []);
      } catch (error) {
        console.error("Error loading chats:", error);
        if (isMounted) setSideButtons([]);
      }
    };
    loadingChats();
    return () => (isMounted = false);
  }, [chatIds]);

  // When user clicks a saved chat in sidebar we fetch its chat history
  async function handleSavedChat(id) {
    setActiveChatId(id);
    setInputResponse(false);
    setChatId(id);
    navigate(`/chat/${id}`);
    setResponses([]);
    setOverlaySideBar(false);

    try {
      const output = await axios.get(`${backendUrl}/chat/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const backendRes = output.data.response || [];

      // backendRes is already an array of { human, bot } pairs
      // map to the UI-friendly shape: { human, bot }
      const mapped = backendRes.map((e) => ({
        human: e.human || "",
        bot: e.bot || "",
      }));

      setResponses(mapped);
      setChatResponse(true);
      setMessages("");
    } catch (err) {
      // console.log("redirecting");
      console.error("Error fetching chat:", err);
      navigate("/chat/0");
      toast.error("Could not load chat");
    }
  }

  function handleNewChat() {
    setResponses([]);
    setMessages("");
    setChatId(0);
    setInputResponse(true);
    setActiveChatId(null);
    setFixedVideoUrl(null);
  }

  function handleDelete(id) {
    axios
      .delete(`${backendUrl}/deleting_chat/${id}`)
      .catch((error) => console.log(error));
    setSideButtons((prev) => prev.filter((item) => item.chat_id !== id));
  }

  useEffect(() => {
    if (Number(chatIds) != 0) {
      handleSavedChat(Number(chatIds));
    } else {
      handleNewChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatIds]);

  // Sidebar click handler that also sets the floating video URL (keeps the single floating player)
  const handleEachThread = (e) => {
    // sidebar div id is `${e.id} ${getYouTubeId(e.url)}` so split by space
    const value = e.target.id ? e.target.id.split(" ") : [];
    const threadId = value[0];
    const vid = value[1];

    if (threadId) navigate(`/chat/${threadId}`);
    if (vid) setFixedVideoUrl(`https://www.youtube.com/embed/${vid}`);
  };

  return (
    <>
      <div className="flex flex-row h-screen bg-mainBg text-white">
        <div>
          {overlaySideBar && (
            <div className=" bg-black bg-opacity-90">
              <SideBar
                designing={
                  "fixed top-0 translate-x-0 bottom-0 flex-shrink-0 z-10"
                }
                iconResponse={true}
              >
                <div className="flex justify-between">
                  <button
                    id="new chat"
                    className="rounded-md hover:bg-hoveringIcon place-items-center size-8"
                    onClick={() => navigate("/chat/0")}
                  >
                    <IoChatboxEllipsesOutline className="size-5" />
                  </button>
                  <button
                    id="cross icon"
                    onClick={() => setOverlaySideBar(!overlaySideBar)}
                    className="rounded-md cursor-ew-resize hover:bg-hoveringIcon place-items-center size-8"
                  >
                    <SideBarItems expanding={<RxCross2 className="size-5" />} />
                  </button>
                </div>
                <div>
                  {sideButtons &&
                    sideButtons.map((e) => (
                      <div
                        key={e.id}
                        id={`${e.id} ${getYouTubeId(e.url)}`}
                        ref={divRef}
                        onClick={handleEachThread}
                        className={`${
                          activeChatId == e.id
                            ? "bg-hoveringIcon"
                            : "hover:bg-hoveringIcon"
                        } my-1 rounded-lg px-2 py-1 cursor-pointer flex justify-between`}
                      >
                        <SideBarSavedChat savedChat={getYouTubeId(e.url)} />
                      </div>
                    ))}
                </div>
              </SideBar>
            </div>
          )}
        </div>

        {mdDevices && (
          <div>
            <SideBar iconResponse={iconResponse}>
              <div className="flex flex-row justify-between">
                {iconResponse && (
                  <button
                    id="new chat"
                    className="rounded-md hover:bg-hoveringIcon place-items-center size-8"
                    onClick={() => navigate("/chat/0")}
                  >
                    <IoChatboxEllipsesOutline className="size-5" />
                  </button>
                )}
                <button
                  id="close and expand"
                  className="size-8 place-items-center cursor-ew-resize hover:bg-hoveringIcon rounded-md"
                  onClick={() => setIconResponse(!iconResponse)}
                >
                  <SideBarItems
                    expanding={
                      iconResponse ? (
                        <GoSidebarExpand className="size-5" />
                      ) : (
                        <GoSidebarCollapse className="size-5" />
                      )
                    }
                  />
                </button>
              </div>

              <div>
                {sideButtons &&
                  sideButtons.map((e, value) => (
                    <div
                      key={value}
                      id={`${e.id} ${getYouTubeId(e.url)}`}
                      onClick={handleEachThread}
                      className={`${
                        activeChatId == e.id
                          ? "bg-hoveringIcon"
                          : "hover:bg-hoveringIcon"
                      } my-1 rounded-lg px-2 py-1 cursor-pointer flex justify-between`}
                    >
                      <SideBarSavedChat savedChat={getYouTubeId(e.url)} />
                    </div>
                  ))}
              </div>
            </SideBar>
          </div>
        )}

        <div
          className={`w-full overflow-hidden focus-visible:outline-0 h-full ${
            overlaySideBar && "bg-black opacity-40 cursor-default"
          }`}
        >
          <NavBar>
            {!mdDevices && (
              <NavBarItem
                context={"MidsterBot"}
                icon={
                  <button
                    id="NavBar"
                    className="hover:bg-hoveringIcon p-2 rounded-xl"
                    onClick={() => setOverlaySideBar(true)}
                  >
                    <HiOutlineBars3 />
                  </button>
                }
              />
            )}
            {mdDevices && (
              <NavBarItem context={"MidsterBot"} logOutFuction={handleLogOut} />
            )}
          </NavBar>

          {/* Floating draggable video (one place) */}
          {fixedVideoUrl && (
            <div
              className="fixed p-0.5 z-[1000] w-[350px] h-[200px] bg-black rounded-xl overflow-hidden border border-gray-700 shadow-xl transition-all cursor-move"
              style={{ top: `${dragPos.y}px`, left: `${dragPos.x}px` }}
              onMouseDown={startDrag}
            >
              <iframe
                className="w-full h-full pointer-events-auto"
                src={fixedVideoUrl}
                allowFullScreen
                frameBorder="0"
              />
            </div>
          )}

          <Responses
            isNewChat={Number(chatIds) === 0}
            inputResponse={inputResponse}
            isLoading={isLoading}
            onSendMessage={handleSubmit}
            handleTextArea={handleTextArea}
          >
            {chatResponse && (
              <div className="max-w-3xl mx-auto">
                {responses.map((value, key) => (
                  <ResponseItems
                    key={key}
                    item={key}
                    humanMsg={value.human}
                    botMsg={value.bot}
                  />
                ))}
              </div>
            )}
          </Responses>
        </div>
      </div>
    </>
  );
}

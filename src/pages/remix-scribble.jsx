import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { postData } from "../helpers/postdata";

const remix = () => {
  const router = useRouter();
  const { id } = router.query;

  // Convert the id to a number and find the post
  const postToDisplay = postData.find((post) => post.id === parseInt(id, 10));

  const words = [
    "Triangle TV",
    "Snowman",
    "Broken Heart",
    "Pineapple",
    "Cupcake",
  ];

  const [currentWord, setCurrentWord] = useState(words[0]); // Initial word
  const wordIndexRef = useRef(0); // To keep track of the current word's index

  useEffect(() => {
    const changeWord = () => {
      wordIndexRef.current = (wordIndexRef.current + 1) % words.length; // Move to the next word, loop back to start if at the end
      setCurrentWord(words[wordIndexRef.current]); // Update the current word
    };

    const wordInterval = setInterval(changeWord, 30000); // Change word every 30 seconds

    return () => clearInterval(wordInterval); // Cleanup on component unmount
  }, [words]);

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState("#000000"); // Initial pen color
  const [penWidth, setPenWidth] = useState(5); // Initial pen width
  const [imageSrc, setImageSrc] = useState(""); // For storing the drawn image
  const [showCanvas, setShowCanvas] = useState(true); // Toggle between canvas and image view

  // Dynamically set canvas size with a fixed height
  const setCanvasSize = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = Math.min(window.innerWidth - 40, 800); // Dynamic width with a max limit
      canvas.height = 400; // Fixed height
    }
  };

  useEffect(() => {
    setCanvasSize();
    // Adjust canvas size on window resize
    window.addEventListener("resize", setCanvasSize);
    return () => {
      window.removeEventListener("resize", setCanvasSize);
    };
  }, []);

  const getCoordinates = (event) => {
    if (event.touches) {
      // Handle touch events
      const canvas = canvasRef.current;
      return {
        offsetX: event.touches[0].clientX - canvas.getBoundingClientRect().left,
        offsetY: event.touches[0].clientY - canvas.getBoundingClientRect().top,
      };
    } else {
      // Handle mouse events
      return {
        offsetX: event.nativeEvent.offsetX,
        offsetY: event.nativeEvent.offsetY,
      };
    }
  };

  const startDrawing = (event) => {
    const { offsetX, offsetY } = getCoordinates(event);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (event) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = getCoordinates(event);
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(offsetX, offsetY);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth; // Use penWidth state for the line width
    ctx.stroke();
  };

  const stopDrawing = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.closePath();
    setIsDrawing(false);
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    const image = canvas.toDataURL("image/png");
    setImageSrc(image);
    setShowCanvas(false); // Switch to image view
  };

  const handleRedraw = () => {
    setImageSrc("");
    setShowCanvas(true); // Switch back to canvas view
    setTimeout(() => {
      // Ensure canvas size is recalculated after it becomes visible again
      setCanvasSize();
    }, 0); // Timeout ensures this runs after the state update has taken effect
  };

  if (!postToDisplay) {
    return <div>Loading post details...</div>;
  }
  return (
    <>
      <Head>
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/inobounce/0.2.1/inobounce.min.js"
          integrity="sha512-Yqdl0nKSSuorWbQ4S9gPMG4THi/meaKxojlnfsak9isATD+dYT2/e7YLw6GyqR1W5uk9rSmv7v4Uu9keCvbYAQ=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        ></script>
      </Head>
      <div className="flex flex-col mt-[16px]">
        <div className="flex flex-row w-full justify-between absolute top-0 pt-[12px] px-[16px] z-50">
          <div className="flex flex-col items-center justify-center w-[40px] h-[40px] rounded-full bg-[#616161] opacity-70 cursor-pointer">
            <Link href={`/post/${id}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                viewBox="0 0 25 25"
                fill="none"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M22.8926 12.6653C22.8926 12.4663 22.8136 12.2756 22.6729 12.1349C22.5323 11.9943 22.3415 11.9153 22.1426 11.9153H4.45308L9.17358 7.19625C9.31441 7.05542 9.39353 6.86442 9.39353 6.66525C9.39353 6.46609 9.31441 6.27508 9.17358 6.13425C9.03275 5.99342 8.84174 5.91431 8.64258 5.91431C8.44341 5.91431 8.25241 5.99342 8.11158 6.13425L2.11158 12.1343C2.04173 12.2039 1.98632 12.2867 1.94851 12.3778C1.9107 12.4689 1.89124 12.5666 1.89124 12.6653C1.89124 12.7639 1.9107 12.8616 1.94851 12.9527C1.98632 13.0438 2.04173 13.1266 2.11158 13.1963L8.11158 19.1963C8.25241 19.3371 8.44341 19.4162 8.64258 19.4162C8.84174 19.4162 9.03275 19.3371 9.17358 19.1963C9.31441 19.0554 9.39353 18.8644 9.39353 18.6653C9.39353 18.4661 9.31441 18.2751 9.17358 18.1343L4.45308 13.4153H22.1426C22.3415 13.4153 22.5323 13.3362 22.6729 13.1956C22.8136 13.0549 22.8926 12.8642 22.8926 12.6653Z"
                  fill="white"
                />
              </svg>
            </Link>
          </div>

          {/* all icons top right */}
          <div className="flex flex-row gap-4 ml-[110px]">
            <div className="flex flex-col items-center justify-center w-[40px] h-[40px] rounded-full bg-[#616161] opacity-70">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="10"
                viewBox="0 0 16 10"
                fill="none"
              >
                <path
                  d="M2.21568 9.32648L3.15868 6.52348H6.63168L7.57568 9.32648H8.83168L5.51168 -0.0045166H4.29368L0.97168 9.32648H2.21568ZM4.91568 1.40348L6.31168 5.55948H3.48168L4.88168 1.40348H4.91568ZM14.0617 8.43048H14.0967V9.32648H15.2247V4.37048C15.2247 2.86048 14.1107 2.02548 12.5787 2.02548C10.8427 2.02548 9.98868 2.94148 9.91268 4.19948H11.0207C11.0887 3.48148 11.6157 3.00948 12.5377 3.00948C13.5087 3.00948 14.0557 3.52948 14.0557 4.47348V5.20448H12.1617C10.5147 5.21148 9.63968 6.00448 9.63968 7.26248C9.63968 8.58148 10.5967 9.44248 11.9847 9.44248C13.0447 9.44248 13.7007 9.01248 14.0627 8.43148L14.0617 8.43048ZM12.2987 8.46548C11.5467 8.46548 10.8427 8.06848 10.8427 7.22148C10.8427 6.57148 11.2667 6.10648 12.2507 6.10648H14.0557V6.94048C14.0557 7.83648 13.3037 8.46548 12.2987 8.46548Z"
                  fill="white"
                />
              </svg>
            </div>

            <div className="flex flex-col items-center justify-center w-[40px] h-[40px] rounded-full bg-[#616161] opacity-70">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 17 17"
                fill="none"
              >
                <path
                  d="M15.9717 12.2455C15.9717 12.5107 15.8663 12.7651 15.6788 12.9526C15.4913 13.1401 15.2369 13.2455 14.9717 13.2455H2.97168C2.70646 13.2455 2.45211 13.1401 2.26457 12.9526C2.07704 12.7651 1.97168 12.5107 1.97168 12.2455V6.24548C1.97168 5.98027 2.07704 5.72591 2.26457 5.53838C2.45211 5.35084 2.70646 5.24548 2.97168 5.24548H4.14368C4.93892 5.24505 5.70145 4.92889 6.26368 4.36648L7.09368 3.53848C7.28068 3.35142 7.53418 3.24607 7.79868 3.24548H10.1427C10.4079 3.24554 10.6622 3.35093 10.8497 3.53848L11.6777 4.36648C11.9563 4.6452 12.2871 4.86628 12.6512 5.0171C13.0153 5.16793 13.4056 5.24553 13.7997 5.24548H14.9717C15.2369 5.24548 15.4913 5.35084 15.6788 5.53838C15.8663 5.72591 15.9717 5.98027 15.9717 6.24548V12.2455ZM2.97168 4.24548C2.44125 4.24548 1.93254 4.4562 1.55747 4.83127C1.18239 5.20634 0.97168 5.71505 0.97168 6.24548L0.97168 12.2455C0.97168 12.7759 1.18239 13.2846 1.55747 13.6597C1.93254 14.0348 2.44125 14.2455 2.97168 14.2455H14.9717C15.5021 14.2455 16.0108 14.0348 16.3859 13.6597C16.761 13.2846 16.9717 12.7759 16.9717 12.2455V6.24548C16.9717 5.71505 16.761 5.20634 16.3859 4.83127C16.0108 4.4562 15.5021 4.24548 14.9717 4.24548H13.7997C13.2693 4.24537 12.7607 4.03458 12.3857 3.65948L11.5577 2.83148C11.1827 2.45638 10.6741 2.2456 10.1437 2.24548H7.79968C7.26929 2.2456 6.76066 2.45638 6.38568 2.83148L5.55768 3.65948C5.18269 4.03458 4.67407 4.24537 4.14368 4.24548H2.97168Z"
                  fill="white"
                />
                <path
                  d="M8.97168 11.2455C8.30864 11.2455 7.67275 10.9821 7.20391 10.5133C6.73507 10.0444 6.47168 9.40852 6.47168 8.74548C6.47168 8.08244 6.73507 7.44656 7.20391 6.97772C7.67275 6.50888 8.30864 6.24548 8.97168 6.24548C9.63472 6.24548 10.2706 6.50888 10.7394 6.97772C11.2083 7.44656 11.4717 8.08244 11.4717 8.74548C11.4717 9.40852 11.2083 10.0444 10.7394 10.5133C10.2706 10.9821 9.63472 11.2455 8.97168 11.2455ZM8.97168 12.2455C9.89994 12.2455 10.7902 11.8767 11.4466 11.2204C12.1029 10.564 12.4717 9.67374 12.4717 8.74548C12.4717 7.81723 12.1029 6.92699 11.4466 6.27061C10.7902 5.61423 9.89994 5.24548 8.97168 5.24548C8.04342 5.24548 7.15318 5.61423 6.49681 6.27061C5.84043 6.92699 5.47168 7.81723 5.47168 8.74548C5.47168 9.67374 5.84043 10.564 6.49681 11.2204C7.15318 11.8767 8.04342 12.2455 8.97168 12.2455ZM3.97168 6.74548C3.97168 6.87809 3.919 7.00527 3.82523 7.09904C3.73146 7.1928 3.60429 7.24548 3.47168 7.24548C3.33907 7.24548 3.21189 7.1928 3.11813 7.09904C3.02436 7.00527 2.97168 6.87809 2.97168 6.74548C2.97168 6.61288 3.02436 6.4857 3.11813 6.39193C3.21189 6.29816 3.33907 6.24548 3.47168 6.24548C3.60429 6.24548 3.73146 6.29816 3.82523 6.39193C3.919 6.4857 3.97168 6.61288 3.97168 6.74548Z"
                  fill="white"
                />
              </svg>
            </div>

            <div className="flex flex-col items-center justify-center w-[40px] h-[40px] rounded-full bg-[#616161] opacity-70">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 17 17"
                fill="none"
              >
                <path
                  d="M4.47168 6.74548C4.60429 6.74548 4.73146 6.79816 4.82523 6.89193C4.919 6.9857 4.97168 7.11288 4.97168 7.24548V8.24548C4.97168 9.30635 5.39311 10.3238 6.14325 11.0739C6.8934 11.8241 7.91081 12.2455 8.97168 12.2455C10.0325 12.2455 11.05 11.8241 11.8001 11.0739C12.5503 10.3238 12.9717 9.30635 12.9717 8.24548V7.24548C12.9717 7.11288 13.0244 6.9857 13.1181 6.89193C13.2119 6.79816 13.3391 6.74548 13.4717 6.74548C13.6043 6.74548 13.7315 6.79816 13.8252 6.89193C13.919 6.9857 13.9717 7.11288 13.9717 7.24548V8.24548C13.9717 9.48501 13.5113 10.6804 12.6798 11.5996C11.8483 12.5189 10.705 13.0965 9.47168 13.2205V15.2455H12.4717C12.6043 15.2455 12.7315 15.2982 12.8252 15.3919C12.919 15.4857 12.9717 15.6129 12.9717 15.7455C12.9717 15.8781 12.919 16.0053 12.8252 16.099C12.7315 16.1928 12.6043 16.2455 12.4717 16.2455H5.47168C5.33907 16.2455 5.21189 16.1928 5.11813 16.099C5.02436 16.0053 4.97168 15.8781 4.97168 15.7455C4.97168 15.6129 5.02436 15.4857 5.11813 15.3919C5.21189 15.2982 5.33907 15.2455 5.47168 15.2455H8.47168V13.2205C7.23836 13.0965 6.09505 12.5189 5.26356 11.5996C4.43206 10.6804 3.97166 9.48501 3.97168 8.24548V7.24548C3.97168 7.11288 4.02436 6.9857 4.11813 6.89193C4.21189 6.79816 4.33907 6.74548 4.47168 6.74548Z"
                  fill="white"
                />
                <path
                  d="M10.9717 8.24548C10.9717 8.77592 10.761 9.28462 10.3859 9.6597C10.0108 10.0348 9.50211 10.2455 8.97168 10.2455C8.44125 10.2455 7.93254 10.0348 7.55747 9.6597C7.18239 9.28462 6.97168 8.77592 6.97168 8.24548V3.24548C6.97168 2.71505 7.18239 2.20634 7.55747 1.83127C7.93254 1.4562 8.44125 1.24548 8.97168 1.24548C9.50211 1.24548 10.0108 1.4562 10.3859 1.83127C10.761 2.20634 10.9717 2.71505 10.9717 3.24548V8.24548ZM8.97168 0.245483C8.17603 0.245483 7.41297 0.561554 6.85036 1.12416C6.28775 1.68677 5.97168 2.44983 5.97168 3.24548V8.24548C5.97168 9.04113 6.28775 9.8042 6.85036 10.3668C7.41297 10.9294 8.17603 11.2455 8.97168 11.2455C9.76733 11.2455 10.5304 10.9294 11.093 10.3668C11.6556 9.8042 11.9717 9.04113 11.9717 8.24548V3.24548C11.9717 2.44983 11.6556 1.68677 11.093 1.12416C10.5304 0.561554 9.76733 0.245483 8.97168 0.245483V0.245483Z"
                  fill="white"
                />
              </svg>
            </div>

            <div className="flex flex-col items-center justify-center w-[40px] h-[40px] rounded-full bg-[#616161] opacity-70">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 17 17"
                fill="none"
              >
                <path
                  d="M14.4695 1.04047L14.6185 0.891471C14.7306 0.779388 14.8638 0.690491 15.0103 0.629857C15.1568 0.569224 15.3138 0.53804 15.4723 0.538086C15.6309 0.538132 15.7879 0.569408 15.9344 0.630128C16.0808 0.690848 16.2139 0.779822 16.326 0.891971C16.4381 1.00412 16.527 1.13725 16.5876 1.28375C16.6482 1.43026 16.6794 1.58727 16.6794 1.74582C16.6793 1.90438 16.6481 2.06137 16.5873 2.20784C16.5266 2.35431 16.4376 2.48739 16.3255 2.59947L16.1765 2.74747C16.4314 3.03333 16.5673 3.40586 16.5563 3.7887C16.5453 4.17154 16.3883 4.53567 16.1175 4.80647L5.8255 15.0995C5.76116 15.1635 5.68061 15.2088 5.59249 15.2305L1.5925 16.2305C1.50879 16.2513 1.42111 16.2501 1.33799 16.2271C1.25487 16.204 1.17912 16.1598 1.11813 16.0988C1.05713 16.0378 1.01295 15.9621 0.989884 15.879C0.966819 15.7959 0.965652 15.7082 0.986496 15.6245L1.9865 11.6245C2.00838 11.5367 2.05365 11.4565 2.1175 11.3925L11.7595 1.75047C11.6631 1.6826 11.5457 1.651 11.4283 1.66124C11.3108 1.67149 11.2007 1.72293 11.1175 1.80647L7.8255 5.09947C7.77901 5.14596 7.72382 5.18284 7.66308 5.20799C7.60234 5.23315 7.53724 5.2461 7.4715 5.2461C7.40575 5.2461 7.34065 5.23315 7.27991 5.20799C7.21917 5.18284 7.16398 5.14596 7.1175 5.09947C7.07101 5.05298 7.03413 4.99779 7.00897 4.93706C6.98381 4.87632 6.97086 4.81122 6.97086 4.74547C6.97086 4.67973 6.98381 4.61463 7.00897 4.55389C7.03413 4.49315 7.07101 4.43796 7.1175 4.39147L10.4115 1.09947C10.6825 0.828486 11.0469 0.671492 11.43 0.660706C11.813 0.649921 12.1857 0.786162 12.4715 1.04147C12.7463 0.79591 13.1018 0.660083 13.4703 0.659898C13.8388 0.659714 14.1945 0.795185 14.4695 1.04047ZM13.8255 1.80647C13.7317 1.71274 13.6046 1.66008 13.472 1.66008C13.3394 1.66008 13.2123 1.71274 13.1185 1.80647L2.9215 12.0015L2.1575 15.0585L5.2145 14.2945L15.4115 4.09947C15.4581 4.05303 15.495 3.99785 15.5202 3.9371C15.5454 3.87636 15.5584 3.81124 15.5584 3.74547C15.5584 3.6797 15.5454 3.61458 15.5202 3.55384C15.495 3.49309 15.4581 3.43792 15.4115 3.39147L13.8265 1.80647H13.8255Z"
                  fill="white"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex flex-row items-center mt-[60px]">
          <div className="flex flex-row gap-[5px] items-center h-[35px]  border-black px-[16px]">
            <img
              className="w-[20px] h-[20px]"
              src="/images/avatar.png"
              alt=""
            />
            <span className="text-[12px] font-medium">ishikapareek</span>
          </div>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="17"
            viewBox="0 0 16 17"
            fill="none"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M0 4.1394C0 4.0068 0.0526784 3.87962 0.146447 3.78585C0.240215 3.69208 0.367392 3.6394 0.5 3.6394H1C3.202 3.6394 4.827 4.8794 5.874 6.0574C6.364 6.6094 6.739 7.1594 7 7.5894C7.26 7.1594 7.636 6.6094 8.126 6.0574C9.173 4.8794 10.798 3.6394 13 3.6394V4.6394C11.202 4.6394 9.827 5.6494 8.874 6.7214C8.3587 7.30507 7.91613 7.94911 7.556 8.6394C7.91582 9.32965 8.35805 9.97368 8.873 10.5574C9.828 11.6294 11.204 12.6394 13 12.6394V13.6394C10.798 13.6394 9.173 12.3994 8.126 11.2214C7.70551 10.7455 7.32866 10.2328 7 9.6894C6.74 10.1194 6.364 10.6694 5.874 11.2214C4.827 12.3994 3.202 13.6394 1 13.6394H0.5C0.367392 13.6394 0.240215 13.5867 0.146447 13.493C0.0526784 13.3992 0 13.272 0 13.1394C0 13.0068 0.0526784 12.8796 0.146447 12.7859C0.240215 12.6921 0.367392 12.6394 0.5 12.6394H1C2.798 12.6394 4.173 11.6294 5.126 10.5574C5.6413 9.97374 6.08387 9.3297 6.444 8.6394C6.08418 7.94916 5.64195 7.30512 5.127 6.7214C4.172 5.6494 2.796 4.6394 1 4.6394H0.5C0.367392 4.6394 0.240215 4.58673 0.146447 4.49296C0.0526784 4.39919 0 4.27201 0 4.1394Z"
              fill="black"
            />
            <path
              d="M13 6.10537V2.17337C13 2.12586 13.0136 2.07935 13.0391 2.03927C13.0646 1.99919 13.101 1.9672 13.144 1.94706C13.187 1.92691 13.2349 1.91944 13.282 1.92552C13.3291 1.93159 13.3735 1.95097 13.41 1.98137L15.77 3.94737C15.89 4.04737 15.89 4.23137 15.77 4.33137L13.41 6.29737C13.3735 6.32777 13.3291 6.34714 13.282 6.35322C13.2349 6.3593 13.187 6.35183 13.144 6.33168C13.101 6.31153 13.0646 6.27955 13.0391 6.23947C13.0136 6.19939 13 6.15287 13 6.10537ZM13 15.1054V11.1734C13 11.1259 13.0136 11.0793 13.0391 11.0393C13.0646 10.9992 13.101 10.9672 13.144 10.9471C13.187 10.9269 13.2349 10.9194 13.282 10.9255C13.3291 10.9316 13.3735 10.951 13.41 10.9814L15.77 12.9474C15.89 13.0474 15.89 13.2314 15.77 13.3314L13.41 15.2974C13.3735 15.3278 13.3291 15.3471 13.282 15.3532C13.2349 15.3593 13.187 15.3518 13.144 15.3317C13.101 15.3115 13.0646 15.2795 13.0391 15.2395C13.0136 15.1994 13 15.1529 13 15.1054Z"
              fill="black"
            />
          </svg>

          <div className="flex flex-row gap-[8px] items-center h-[35px]  border-black px-[16px]">
            <img
              className="w-[20px] h-[20px] rounded-full"
              src={postToDisplay.avatar}
              alt=""
            />
            <span className="text-[12px] font-medium">
              {postToDisplay.username}
            </span>
          </div>
        </div>

        <div className="flex flex-row gap-2 ml-4 mt-[8px]">
          <img
            className="border border-black rounded-[2px] rounded-4 w-[40px] h-[40px]"
            src={postToDisplay.thumbnail}
          />
          <div>
            <div className="text-[14px] w-[297px]">
              {postToDisplay.title}/{" "}
              <span className="text-[14px] text-primary font-[700]">
                {postToDisplay.tag}
              </span>
            </div>

            <div>
              <p className="text-[12px] text-[#262626] opacity-70 mt-[4px] ">
                comment to view your visual on the post
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center mx-[10px] mt-[12px] w-[370px] h-[358px] border-[1px] rounded-[8px]">
          <div className="flex flex-col items-center justify-center">
            {showCanvas ? (
              <>
                <div
                  className="canvas-container"
                  style={{ width: "100%", overflow: "hidden" }}
                >
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="h-[358px] w-[370px]"
                    style={{ touchAction: "none" }} // Prevent scrolling on touch devices
                  />
                </div>
              </>
            ) : (
              <>
                <img
                  src={imageSrc}
                  alt="Saved Drawing"
                  className="h-[358px] w-[370px]"
                />
              </>
            )}
          </div>
        </div>
        <div className="flex gap-[20px]  flex-wrap items-center px-[25px] pt-[10px]">
          <input
            type="color"
            value={penColor}
            onChange={(e) => setPenColor(e.target.value)}
            className="mr-4"
          />
          <input
            type="range"
            min="1"
            max="20"
            value={penWidth}
            onChange={(e) => setPenWidth(e.target.value)}
            className="w-32"
          />
          <span className="text-primary font-[500]">{currentWord}</span>
        </div>

        {/* post button and redo */}
        <div className="bg-white flex flex-row h-[60px] mb-0 justify-between items-center mt-[30px]">
          {showCanvas ? (
            <button
              onClick={saveDrawing}
              className="bg-none text-primary h-[40px] text-[16px] ml-[12px]"
            >
              Save
            </button>
          ) : (
            <button
              onClick={handleRedraw}
              className="bg-none text-black h-[40px] text-[16px] ml-[12px]"
            >
              Redraw
            </button>
          )}
          <button className="bg-[#262626] w-[130px] h-[40px] mr-[12px]  rounded-[8px] text-white ">
            Post
          </button>
        </div>
      </div>
    </>
  );
};

export default remix;

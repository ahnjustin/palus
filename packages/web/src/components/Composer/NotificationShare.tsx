import {
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";
import {
  forwardRef,
  type HTMLAttributes,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { Image, Tooltip } from "@/components/Shared/UI";
import { componentToPng } from "@/helpers/componentToPng";
import { formatWithZeroSubscript } from "@/helpers/formatValues";
import getAccount from "@/helpers/getAccount";
import getAvatar from "@/helpers/getAvatar";
import { usePostStore } from "@/store/non-persisted/post/usePostStore";
import { useAccountStore } from "@/store/persisted/useAccountStore";

const CARD_WIDTH = 480;
const CARD_HEIGHT = 300;

const NotificationShare = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>((props, ref) => {
  const [bgIndex, setBgIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [amountFontSize, setAmountFontSize] = useState(64);
  const containerRef = useRef<HTMLDivElement>(null);
  const amountRef = useRef<HTMLDivElement>(null);
  const { notificationShare } = usePostStore();
  const { currentAccount } = useAccountStore();

  const value = notificationShare?.amount.value;

  const formattedAmount = useMemo(() => {
    if (!value) return "";

    const [, frac = ""] = value.split(".");
    const len = frac.length;
    if (len > 5) return formatWithZeroSubscript(value);

    const num = Number(value);
    if (len <= 2) {
      return new Intl.NumberFormat("default", {
        minimumFractionDigits: len === 1 ? 2 : 0
      }).format(num);
    }

    return value;
  }, [value]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScale = () => {
      const containerWidth = container.offsetWidth;
      setScale(containerWidth / CARD_WIDTH);
    };

    updateScale();

    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  // Calculate optimal font size for amount text
  useEffect(() => {
    const amountEl = amountRef.current;
    if (!amountEl) return;

    const containerWidth = CARD_WIDTH - 68 - 24; // left-17 (68px) and right-6 (24px)
    const maxFontSize = 64;
    const minFontSize = 16;

    let fontSize = maxFontSize;
    amountEl.style.fontSize = `${fontSize}px`;

    while (fontSize > minFontSize && amountEl.scrollWidth > containerWidth) {
      fontSize -= 2;
      amountEl.style.fontSize = `${fontSize}px`;
    }

    setAmountFontSize(fontSize);
  }, [formattedAmount, notificationShare?.amount.asset.symbol]);

  if (!notificationShare || !currentAccount?.username) return null;

  const downloadImage = async () => {
    if (!ref || typeof ref === "function") return;
    const element = ref.current;
    if (!element) return;
    const dataUrl = await componentToPng(element);
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.download = "palus-share.png";
    link.href = dataUrl;
    link.click();
  };

  const account = notificationShare.executedBy;
  const actor = getAccount(account);

  const title =
    notificationShare.type === "collect"
      ? "collected my post"
      : notificationShare.type === "post-tip"
        ? "tipped my post"
        : notificationShare.type === "account-tip" && "tipped me";

  return (
    <div
      className="relative w-full"
      ref={containerRef}
      style={{ height: CARD_HEIGHT * scale }}
    >
      <div
        className={`waves-${bgIndex} relative h-75 w-120 origin-top-left overflow-hidden rounded-xl border border-border`}
        ref={ref}
        {...props}
        style={{ transform: `scale(${scale})` }}
      >
        <div className="absolute top-5 left-5 flex items-center gap-x-2 text-2xl text-white">
          <Image
            alt={actor.username}
            className="size-11 flex-none rounded-full border border-border bg-gray-200 object-cover"
            height={64}
            loading="lazy"
            src={getAvatar(account)}
            width={64}
          />
          <div className="flex min-w-0 flex-col">
            <div className="flex min-w-0 flex-wrap items-center gap-x-1.5">
              <span className="truncate font-bold">{actor.name}</span>
              <span className="truncate pb-0.5 font-semibold text-gray-200">
                @{actor.username}
              </span>
            </div>
            <div className="text-white text-xl">{title}!</div>
          </div>
        </div>
        <div
          className="-translate-y-1/2 absolute top-1/2 right-6 left-17 text-white drop-shadow-black/30 drop-shadow-xs"
          ref={amountRef}
          style={{ fontSize: amountFontSize, lineHeight: 1.2 }}
        >
          <div className="flex items-center gap-x-2 whitespace-nowrap pt-7">
            <span className="font-bold">
              {notificationShare.amount.__typename === "NativeAmount"
                ? "$"
                : ""}
              {formattedAmount}
            </span>
            <span className="text-gray-200 tracking-tighter">
              {notificationShare.amount.__typename === "Erc20Amount" ? "$" : ""}
              {notificationShare.amount.asset.symbol}
            </span>
          </div>
        </div>
        <div className="absolute bottom-3 left-5 flex items-center gap-x-2">
          <Image
            alt="Palus Logo"
            className="mt-0.5 size-6"
            height={24}
            src="/favicon.svg"
            width={24}
          />
          <div className="font-semibold text-base text-black opacity-75">{`palus.app/u/${currentAccount.username.localName}`}</div>
        </div>
        <Image
          alt="Lens Logo"
          className="absolute right-5 bottom-3 mt-0.5 size-6 drop-shadow-black/30 drop-shadow-xs"
          height={24}
          src="/images/lens.svg"
          width={24}
        />
        <div
          className="controls absolute top-3 right-3 flex origin-top-right gap-2"
          style={{ transform: `scale(${1 / scale})` }}
        >
          <Tooltip content="Previous background" placement="top" withDelay>
            <button
              aria-label="Previous background"
              className="center flex rounded-full bg-black/30 p-2 text-gray-400 hover:text-white"
              onClick={() => setBgIndex((i) => (i - 1 + 10) % 10)}
              type="button"
            >
              <ChevronLeftIcon className="size-3" strokeWidth={4} />
            </button>
          </Tooltip>
          <Tooltip content="Next background" placement="top" withDelay>
            <button
              aria-label="Next background"
              className="center flex rounded-full bg-black/30 p-2 text-gray-400 hover:text-white"
              onClick={() => setBgIndex((i) => (i + 1) % 10)}
              type="button"
            >
              <ChevronRightIcon className="size-3" strokeWidth={4} />
            </button>
          </Tooltip>
          <Tooltip content="Download image" placement="top">
            <button
              aria-label="Download"
              className="center flex rounded-full bg-black/30 p-2 text-gray-400 hover:text-white"
              onClick={downloadImage}
              type="button"
            >
              <ArrowDownTrayIcon className="size-3" strokeWidth={3} />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
});

export default NotificationShare;

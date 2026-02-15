import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import {
  forwardRef,
  type HTMLAttributes,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { Image } from "@/components/Shared/UI";
import cn from "@/helpers/cn";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const { notificationShare } = usePostStore();
  const { currentAccount } = useAccountStore();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScale = () => {
      const containerWidth = container.offsetWidth;
      setScale(Math.min(1, containerWidth / CARD_WIDTH));
    };

    updateScale();

    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  const formattedAmount = useMemo(() => {
    if (!notificationShare?.amount.value) {
      return "";
    }
    const amount = notificationShare.amount.value;
    const parts = amount.split(".");
    const frac = parts[1] ?? "";
    if (frac.length > 6) {
      return formatWithZeroSubscript(amount);
    }
    const num = Number(amount);
    const fracNoTrailing = frac.replace(/0+$/, "");
    if (fracNoTrailing.length <= 2) {
      return new Intl.NumberFormat("default", {
        minimumFractionDigits: fracNoTrailing.length === 1 ? 2 : 0
      }).format(num);
    }
    const decimals =
      fracNoTrailing.length <= 6 ? Math.min(6, fracNoTrailing.length) : 2;
    return `${num.toFixed(decimals)}`;
  }, [notificationShare?.amount.value]);

  if (!notificationShare || !currentAccount?.username) return null;

  const account = notificationShare.executedBy;
  const actor = getAccount(account);
  const avatar = getAvatar(account);

  const title =
    notificationShare.type === "collect"
      ? "collected my post"
      : notificationShare.type === "post-tip"
        ? "tipped my post"
        : notificationShare.type === "account-tip" && "tipped me";

  const amountLength =
    formattedAmount.length + notificationShare.amount.asset.symbol.length;

  return (
    <div
      className="relative w-full"
      ref={containerRef}
      style={{ height: CARD_HEIGHT * scale }}
    >
      <div
        className={`waves-${bgIndex} relative h-75 w-120 origin-top-left rounded-xl border border-border`}
        ref={ref}
        style={{ transform: `scale(${scale})` }}
        {...props}
      >
        <div className="absolute top-5 left-5 flex items-center gap-x-2 text-2xl text-white">
          <Image
            alt={account.address}
            className="size-11 flex-none rounded-full border border-border bg-gray-200"
            height={64}
            loading="lazy"
            src={avatar}
            width={64}
          />
          <div className="flex min-w-0 flex-col">
            <div className="flex min-w-0 flex-wrap items-center gap-x-1">
              <span className="truncate font-bold">{actor.name}</span>
              <span className="truncate pb-0.5 font-semibold text-gray-200">
                @{getAccount(account).username}
              </span>
            </div>
            <div className="text-white text-xl">{title}!</div>
          </div>
        </div>
        <div
          className={cn(
            "absolute top-35 right-0 left-16 text-white leading-14 drop-shadow-black/30 drop-shadow-xs",
            {
              "text-2xl": amountLength > 18,
              "text-3xl": amountLength > 14 && amountLength <= 18,
              "text-4xl": amountLength > 10 && amountLength <= 14,
              "text-5xl": amountLength <= 10
            }
          )}
        >
          <div className="flex min-w-0 flex-wrap items-center gap-x-2">
            <span className="truncate font-bold">
              {notificationShare.amount.__typename === "NativeAmount"
                ? "$"
                : ""}
              {formattedAmount}
            </span>{" "}
            <span className="text-gray-200">
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
          <div className="font-semibold text-base text-black">{`palus.app/u/${currentAccount.username.localName}`}</div>
        </div>
        <Image
          alt="Lens Logo"
          className="absolute right-5 bottom-3 mt-0.5 size-6 drop-shadow-sm"
          height={24}
          src="/images/lens.svg"
          width={24}
        />
        <div
          className="background-controls absolute top-3 right-3 flex origin-top-right gap-2"
          style={{ transform: `scale(${1 / scale})` }}
        >
          <button
            aria-label="Previous background"
            className="center flex rounded-full bg-black/50 p-2 text-gray-400 hover:text-white"
            onClick={() => setBgIndex((i) => (i - 1 + 7) % 7)}
            type="button"
          >
            <ChevronLeftIcon className="size-3" strokeWidth={4} />
          </button>
          <button
            aria-label="Next background"
            className="center flex rounded-full bg-black/50 p-2 text-gray-400 hover:text-white"
            onClick={() => setBgIndex((i) => (i + 1) % 7)}
            type="button"
          >
            <ChevronRightIcon className="size-3" strokeWidth={4} />
          </button>
        </div>
      </div>
    </div>
  );
});

export default NotificationShare;

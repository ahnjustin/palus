import type { PostFragment } from "@palus/indexer";
import { createTrackedStore } from "@/store/createTrackedStore";

interface State {
  postContent: string;
  quotedPost?: PostFragment;
  editingPost?: PostFragment;
  parentPost?: PostFragment;
  ignoreQuotedPost?: boolean;
  setPostContent: (postContent: string) => void;
  setQuotedPost: (quotedPost?: PostFragment) => void;
  setEditingPost: (editingPost?: PostFragment) => void;
  setParentPost: (parentPost?: PostFragment) => void;
  setIgnoreQuotedPost: (ignoreQuotedPost: boolean) => void;
}

const { useStore: usePostStore } = createTrackedStore<State>((set) => ({
  editingPost: undefined,
  ignoreQuotedPost: false,
  parentPost: undefined,
  postContent: "",
  quotedPost: undefined,
  setEditingPost: (editingPost) => set(() => ({ editingPost })),
  setIgnoreQuotedPost: (ignoreQuotedPost) => set(() => ({ ignoreQuotedPost })),
  setParentPost: (parentPost) => set(() => ({ parentPost })),
  setPostContent: (postContent) => set(() => ({ postContent })),
  setQuotedPost: (quotedPost) => set(() => ({ quotedPost }))
}));

export { usePostStore };

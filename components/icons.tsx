import React from 'react';
import {
  Sun,
  Moon,
  Bold,
  Italic,
  Heading,
  Strikethrough,
  Link,
  Image,
  Quote,
  Code2,
  List,
  ListOrdered,
  Sparkles,
  Wand2,
  Download,
  Search,
  ChevronUp,
  ChevronDown,
  X,
  WrapText,
  Crown,
  Play,
  Pause,
  LoaderCircle,
  XCircle,
  PenLine,
  CheckCircle2,
  MessageSquare,
  Send,
  Bot,
  ListTree,
  type LucideProps,
} from 'lucide-react';

// A simple HOC to apply consistent styling to all icons from a single point.
const createIcon = (IconComponent: React.ComponentType<LucideProps>): React.FC<LucideProps> => {
  const WrappedIcon: React.FC<LucideProps> = (props) => (
    <IconComponent strokeWidth={1.5} {...props} />
  );
  WrappedIcon.displayName = IconComponent.displayName;
  return WrappedIcon;
};

export const MonarchIcon = createIcon(Crown);
export const SunIcon = createIcon(Sun);
export const MoonIcon = createIcon(Moon);
export const BoldIcon = createIcon(Bold);
export const ItalicIcon = createIcon(Italic);
export const HeadingIcon = createIcon(Heading);
export const StrikethroughIcon = createIcon(Strikethrough);
export const LinkIcon = createIcon(Link);
export const ImageIcon = createIcon(Image);
export const QuoteIcon = createIcon(Quote);
export const CodeIcon = createIcon(Code2);
export const ListUnorderedIcon = createIcon(List);
export const ListOrderedIcon = createIcon(ListOrdered);
export const SparklesIcon = createIcon(Sparkles);
export const MagicWandIcon = createIcon(Wand2);
export const DownloadIcon = createIcon(Download);
export const SearchIcon = createIcon(Search);
export const ChevronUpIcon = createIcon(ChevronUp);
export const ChevronDownIcon = createIcon(ChevronDown);
export const CloseIcon = createIcon(X);
export const WordWrapIcon = createIcon(WrapText);
export const PlayIcon = createIcon(Play);
export const PauseIcon = createIcon(Pause);
export const LoaderIcon = createIcon(LoaderCircle);
export const StopIcon = createIcon(XCircle);
export const PenLineIcon = createIcon(PenLine);
export const CheckCircleIcon = createIcon(CheckCircle2);
export const MessageSquareIcon = createIcon(MessageSquare);
export const SendIcon = createIcon(Send);
export const BotIcon = createIcon(Bot);
export const ListTreeIcon = createIcon(ListTree);
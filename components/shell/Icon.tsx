import {
  ArrowsLeftRight,
  Bank,
  Broom,
  CaretLeft,
  CaretRight,
  ChartBar,
  ChartDonut,
  CheckCircle,
  CreditCard,
  Flag,
  Gear,
  House,
  Lightbulb,
  Lock,
  MagnifyingGlass,
  Moon,
  Mountains,
  PencilSimple,
  PiggyBank,
  Plus,
  ShoppingBag,
  SquaresFour,
  Sun,
  Target,
  Wallet,
  Warning,
} from '@phosphor-icons/react/dist/ssr';

/** Derived from a concrete icon so it tracks the package's own prop shape. */
type IconProps = React.ComponentProps<typeof Bank>;

/**
 * The design uses Phosphor duotone throughout. Icons are addressed by name so
 * nav config stays serialisable across the server/client boundary.
 */
const ICONS = {
  'arrows-left-right': ArrowsLeftRight,
  bank: Bank,
  broom: Broom,
  'caret-left': CaretLeft,
  'caret-right': CaretRight,
  'chart-bar': ChartBar,
  'chart-donut': ChartDonut,
  'check-circle': CheckCircle,
  'credit-card': CreditCard,
  flag: Flag,
  gear: Gear,
  house: House,
  lightbulb: Lightbulb,
  lock: Lock,
  'magnifying-glass': MagnifyingGlass,
  moon: Moon,
  mountains: Mountains,
  'pencil-simple': PencilSimple,
  'piggy-bank': PiggyBank,
  plus: Plus,
  'shopping-bag': ShoppingBag,
  'squares-four': SquaresFour,
  sun: Sun,
  target: Target,
  wallet: Wallet,
  warning: Warning,
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  ...props
}: { name: IconName } & Omit<IconProps, 'ref'>) {
  const Glyph = ICONS[name];
  return (
    <Glyph
      weight='duotone'
      {...props}
    />
  );
}

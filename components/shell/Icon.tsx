import {
  ArrowsLeftRight,
  Bank,
  Broom,
  CaretLeft,
  CaretRight,
  ChartDonut,
  Gear,
  Lightbulb,
  MagnifyingGlass,
  Moon,
  PencilSimple,
  Plus,
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
  'chart-donut': ChartDonut,
  gear: Gear,
  lightbulb: Lightbulb,
  'magnifying-glass': MagnifyingGlass,
  moon: Moon,
  'pencil-simple': PencilSimple,
  plus: Plus,
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

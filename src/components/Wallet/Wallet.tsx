import React, { useState } from 'react';
import './Wallet.css';

export interface WalletCard {
  /** 卡片顶部的品牌名(支持 ReactNode 便于做彩色品牌字) */
  brand: React.ReactNode;
  /** 背景色,如 #635bff */
  background?: string;
  /** 文字颜色,默认白色(浅色背景卡片请传深色) */
  color?: string;
  /** 左下角标签,如 "Holder" / "Email" */
  label?: string;
  /** 左下角值,如持卡人姓名 / 邮箱 */
  value?: React.ReactNode;
  /** 收起时右下角显示的尾号,如 "**** 4242" */
  masked?: string;
  /** 展开(hover 单卡)时显示的完整卡号 */
  number?: string;
  /** 芯片颜色(浅色卡片可传 rgba(0,0,0,0.05)) */
  chipColor?: string;
  /** 标签文字颜色 */
  labelColor?: string;
  /** 额外 className */
  className?: string;
}

export interface WalletProps {
  /** 卡片列表(按堆叠顺序,最后一张在最上) */
  cards: WalletCard[];
  /** 余额展示值,如 "$12,450.00" */
  balance: React.ReactNode;
  /** 余额下方说明文字 */
  balanceLabel?: string;
  /** 遮罩显示(未 hover 时),默认 "******" */
  balanceMask?: string;
  /** 底部提示语,传 null 则隐藏 */
  hint?: React.ReactNode | null;
  /** 口袋颜色 */
  pocketColor?: string;
  /** 口袋缝线颜色 */
  pocketStitchColor?: string;
  /** 眼睛图标颜色 */
  eyeColor?: string;
  className?: string;
  style?: React.CSSProperties;
  /** 加载态 */
  loading?: boolean;
}

const DEFAULT_POCKET = '#1e341e';
const DEFAULT_STITCH = '#3d5635';
const DEFAULT_EYE = '#3be60b';

const PocketSvg: React.FC<{ fill: string; stroke: string }> = ({ fill, stroke }) => (
  <svg className="au-wallet__pocket-svg" viewBox="0 0 280 160" fill="none" aria-hidden>
    <path
      d="M 0 20 C 0 10, 5 10, 10 10 C 20 10, 25 25, 40 25 L 240 25 C 255 25, 260 10, 270 10 C 275 10, 280 10, 280 20 L 280 120 C 280 155, 260 160, 240 160 L 40 160 C 20 160, 0 155, 0 120 Z"
      fill={fill}
    />
    <path
      d="M 8 22 C 8 16, 12 16, 15 16 C 23 16, 27 29, 40 29 L 240 29 C 253 29, 257 16, 265 16 C 268 16, 272 16, 272 22 L 272 120 C 272 150, 255 152, 240 152 L 40 152 C 25 152, 8 152, 8 120 Z"
      stroke={stroke}
      strokeWidth={1.5}
      strokeDasharray="6 4"
    />
  </svg>
);

const EyeSlashIcon = () => (
  <svg
    className="au-wallet__eye au-wallet__eye--slash"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx={12} cy={12} r={3} />
    <line x1={3} y1={3} x2={21} y2={21} />
  </svg>
);

const EyeOpenIcon = () => (
  <svg
    className="au-wallet__eye au-wallet__eye--open"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx={12} cy={12} r={3} />
  </svg>
);

const Wallet: React.FC<WalletProps> = ({
  cards,
  balance,
  balanceLabel = 'Total Balance',
  balanceMask = '******',
  hint = 'Hover to see Balance',
  pocketColor = DEFAULT_POCKET,
  pocketStitchColor = DEFAULT_STITCH,
  eyeColor = DEFAULT_EYE,
  className = '',
  style,
  loading,
}) => {
  const [hovered, setHovered] = useState(false);
  const total = cards.length;

  const rootStyle: React.CSSProperties = {
    ['--au-wallet-pocket' as string]: pocketColor,
    ['--au-wallet-eye' as string]: eyeColor,
    ...style,
  };

  if (loading) {
    return (
      <div className={['au-wallet', 'is-loading', className].filter(Boolean).join(' ')} style={style}>
        <div className="au-skel-block" style={{ width: 280, height: 200, borderRadius: 16 }} />
      </div>
    );
  }

  return (
    <div
      className={['au-wallet', hint ? 'au-wallet--has-hint' : '', className]
        .filter(Boolean)
        .join(' ')}
      style={rootStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-hint={typeof hint === 'string' ? hint : undefined}
    >
      <div className="au-wallet__back" />

      {cards.map((card, i) => {
        const depth = total - 1 - i;
        const cardStyle: React.CSSProperties = {
          background: card.background,
          color: card.color,
          bottom: 40 + depth * 25,
          zIndex: 10 + i * 10,
          animationDelay: `${0.1 + i * 0.1}s`,
        };
        const rot = i % 3 === 0 ? -3 : i % 3 === 1 ? 2 : 0;
        const fanY = -(75 - i * 30);
        (cardStyle as Record<string, string | number>)['--au-wallet-fan-y'] =
          `${fanY}px`;
        (cardStyle as Record<string, string | number>)['--au-wallet-rotate'] =
          `${rot}deg`;
        if (card.labelColor) {
          (cardStyle as Record<string, string>)['--au-wallet-label'] = card.labelColor;
        }
        if (card.chipColor) {
          (cardStyle as Record<string, string>)['--au-wallet-chip'] = card.chipColor;
        }

        return (
          <div
            key={i}
            className={['au-wallet__card', card.className].filter(Boolean).join(' ')}
            style={cardStyle}
          >
            <div className="au-wallet__card-inner">
              <div className="au-wallet__card-top">
                <span>{card.brand}</span>
                <div className="au-wallet__chip" />
              </div>
              <div className="au-wallet__card-bottom">
                <div className="au-wallet__card-info">
                  {card.label && (
                    <span className="au-wallet__label">{card.label}</span>
                  )}
                  {card.value && (
                    <span className="au-wallet__value">{card.value}</span>
                  )}
                </div>
                <div className="au-wallet__number-wrapper">
                  {card.masked && (
                    <span className="au-wallet__number-masked">{card.masked}</span>
                  )}
                  {card.number && (
                    <span className="au-wallet__number">{card.number}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div className="au-wallet__pocket">
        <PocketSvg fill={pocketColor} stroke={pocketStitchColor} />
        <div className="au-wallet__pocket-content">
          <div className="au-wallet__balance-row">
            <div className="au-wallet__balance-mask">{balanceMask}</div>
            <div className="au-wallet__balance-real">{balance}</div>
          </div>
          <div className="au-wallet__balance-label">{balanceLabel}</div>
          <div className="au-wallet__eye-wrapper" aria-hidden>
            <EyeSlashIcon />
            <EyeOpenIcon />
          </div>
        </div>
      </div>

      {/* hovered state exposed as data-attr for potential consumer hooks */}
      <span hidden data-hovered={hovered ? '1' : '0'} />
    </div>
  );
};

export default Wallet;

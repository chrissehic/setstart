import * as React from "react";
import { SVGProps } from "react";

interface SetIconProps extends SVGProps<SVGSVGElement> {
  color?: string;
  fill?: string;
  animated?: boolean;
}

const SetIcon = ({ color, fill, animated = false, ...props }: SetIconProps) => {
  // Use provided color/fill or fall back to currentColor
  const iconColor = color || fill || "currentColor";
  
  // Generate unique IDs for this instance
  const uniqueId = React.useId();
  const gradientIds = {
    a: `a-${uniqueId}`,
    b: `b-${uniqueId}`,
    c: `c-${uniqueId}`,
    d: `d-${uniqueId}`,
    e: `e-${uniqueId}`,
    f: `f-${uniqueId}`,
    g: `g-${uniqueId}`,
    h: `h-${uniqueId}`,
    i: `i-${uniqueId}`,
    j: `j-${uniqueId}`,
    k: `k-${uniqueId}`,
    l: `l-${uniqueId}`,
    m: `m-${uniqueId}`,
    n: `n-${uniqueId}`,
  };

  // Custom animation styles
  const animationStyle = animated ? {
    animation: 'flowingPulse 2s ease-in-out infinite',
  } : {};

  const animationDelays = [
    '0ms', '100ms', '200ms', '300ms', '400ms', '500ms', '600ms',
    '700ms', '800ms', '900ms', '1000ms', '1100ms', '1200ms', '1300ms'
  ];
  
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes flowingPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
        `
      }} />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="inherit"
        viewBox="0 0 44 48"
        {...props}
      >
        <path
          fill={`url(#${gradientIds.a})`}
          d="M2.196 33.106a1.098 1.098 0 0 1-2.196 0V20.255a1.098 1.098 0 1 1 2.196 0v12.85Z"
          style={animated ? { ...animationStyle, animationDelay: animationDelays[0] } : {}}
        />
        <path
          fill={`url(#${gradientIds.b})`}
          d="M7.297 29.645a1.01 1.01 0 0 1-2.019 0V12.854a1.01 1.01 0 0 1 2.019 0v16.79Z"
          style={animated ? { ...animationStyle, animationDelay: animationDelays[1] } : {}}
        />
        <path
          fill={`url(#${gradientIds.c})`}
          d="M12.4 26.181a.922.922 0 0 1-1.844 0V7.836a.922.922 0 1 1 1.844 0V26.18Z"
          style={animated ? { ...animationStyle, animationDelay: animationDelays[2] } : {}}
        />
        <path
          fill={`url(#${gradientIds.d})`}
          d="M17.501 23.533a.834.834 0 0 1-1.669 0V3.777a.834.834 0 1 1 1.669 0v19.756Z"
          style={animated ? { ...animationStyle, animationDelay: animationDelays[3] } : {}}
        />
        <path
          fill={`url(#${gradientIds.e})`}
          d="M22.602 20.887a.746.746 0 0 1-1.492 0V1.88a.746.746 0 1 1 1.492 0v19.007Z"
          style={animated ? { ...animationStyle, animationDelay: animationDelays[4] } : {}}
        />
        <path
          fill={`url(#${gradientIds.f})`}
          d="M27.704 19.053a.658.658 0 0 1-1.316 0V.797a.658.658 0 1 1 1.316 0v18.256Z"
          style={animated ? { ...animationStyle, animationDelay: animationDelays[5] } : {}}
        />
        <path
          fill={`url(#${gradientIds.g})`}
          d="M32.63 17.367a.482.482 0 1 1-.965 0V1.27a.482.482 0 1 1 .965 0v16.096Z"
          style={animated ? { ...animationStyle, animationDelay: animationDelays[6] } : {}}
        />
        <path
          fill={`url(#${gradientIds.h})`}
          d="M41.804 18.789a1.098 1.098 0 0 1 2.196 0v12.85a1.098 1.098 0 1 1-2.196 0V18.79Z"
          style={animated ? { ...animationStyle, animationDelay: animationDelays[7] } : {}}
        />
        <path
          fill={`url(#${gradientIds.i})`}
          d="M36.703 22.25a1.01 1.01 0 0 1 2.019 0v16.79a1.01 1.01 0 1 1-2.019 0V22.25Z"
          style={animated ? { ...animationStyle, animationDelay: animationDelays[8] } : {}}
        />
        <path
          fill={`url(#${gradientIds.j})`}
          d="M31.6 25.713a.922.922 0 0 1 1.844 0V44.06a.922.922 0 0 1-1.844 0V25.714Z"
          style={animated ? { ...animationStyle, animationDelay: animationDelays[9] } : {}}
        />
        <path
          fill={`url(#${gradientIds.k})`}
          d="M26.499 28.361a.834.834 0 0 1 1.669 0v19.756a.834.834 0 1 1-1.669 0V28.361Z"
          style={animated ? { ...animationStyle, animationDelay: animationDelays[10] } : {}}
        />
        <path
          fill={`url(#${gradientIds.l})`}
          d="M21.398 31.008a.746.746 0 1 1 1.492 0v19.007a.746.746 0 0 1-1.492 0V31.008Z"
          style={animated ? { ...animationStyle, animationDelay: animationDelays[11] } : {}}
        />
        <path
          fill={`url(#${gradientIds.m})`}
          d="M16.296 32.842a.658.658 0 1 1 1.316 0v18.256a.658.658 0 1 1-1.316 0V32.842Z"
          style={animated ? { ...animationStyle, animationDelay: animationDelays[12] } : {}}
        />
        <path
          fill={`url(#${gradientIds.n})`}
          d="M11.37 34.528a.482.482 0 1 1 .965 0v16.095a.482.482 0 1 1-.965 0V34.528Z"
          style={animated ? { ...animationStyle, animationDelay: animationDelays[13] } : {}}
        />
        <defs>
          <linearGradient
            id={gradientIds.a}
            x1={0}
            x2={43.5}
            y1={17.465}
            y2={17.465}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={iconColor} />
            <stop offset={1} stopColor={iconColor} stopOpacity={0} />
          </linearGradient>
          <linearGradient
            id={gradientIds.b}
            x1={0}
            x2={43.5}
            y1={17.465}
            y2={17.465}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={iconColor} />
            <stop offset={1} stopColor={iconColor} stopOpacity={0} />
          </linearGradient>
          <linearGradient
            id={gradientIds.c}
            x1={0}
            x2={43.5}
            y1={17.465}
            y2={17.465}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={iconColor} />
            <stop offset={1} stopColor={iconColor} stopOpacity={0} />
          </linearGradient>
          <linearGradient
            id={gradientIds.d}
            x1={0}
            x2={43.5}
            y1={17.465}
            y2={17.465}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={iconColor} />
            <stop offset={1} stopColor={iconColor} stopOpacity={0} />
          </linearGradient>
          <linearGradient
            id={gradientIds.e}
            x1={0}
            x2={43.5}
            y1={17.465}
            y2={17.465}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={iconColor} />
            <stop offset={1} stopColor={iconColor} stopOpacity={0} />
          </linearGradient>
          <linearGradient
            id={gradientIds.f}
            x1={0}
            x2={43.5}
            y1={17.465}
            y2={17.465}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={iconColor} />
            <stop offset={1} stopColor={iconColor} stopOpacity={0} />
          </linearGradient>
          <linearGradient
            id={gradientIds.g}
            x1={0}
            x2={43.5}
            y1={17.465}
            y2={17.465}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={iconColor} />
            <stop offset={1} stopColor={iconColor} stopOpacity={0} />
          </linearGradient>
          <linearGradient
            id={gradientIds.h}
            x1={0.5}
            x2={44}
            y1={34.43}
            y2={34.43}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={iconColor} stopOpacity={0} />
            <stop offset={1} stopColor={iconColor} />
          </linearGradient>
          <linearGradient
            id={gradientIds.i}
            x1={0.5}
            x2={44}
            y1={34.43}
            y2={34.43}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={iconColor} stopOpacity={0} />
            <stop offset={1} stopColor={iconColor} />
          </linearGradient>
          <linearGradient
            id={gradientIds.j}
            x1={0.5}
            x2={44}
            y1={34.43}
            y2={34.43}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={iconColor} stopOpacity={0} />
            <stop offset={1} stopColor={iconColor} />
          </linearGradient>
          <linearGradient
            id={gradientIds.k}
            x1={0.5}
            x2={44}
            y1={34.43}
            y2={34.43}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={iconColor} stopOpacity={0} />
            <stop offset={1} stopColor={iconColor} />
          </linearGradient>
          <linearGradient
            id={gradientIds.l}
            x1={0.5}
            x2={44}
            y1={34.43}
            y2={34.43}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={iconColor} stopOpacity={0} />
            <stop offset={1} stopColor={iconColor} />
          </linearGradient>
          <linearGradient
            id={gradientIds.m}
            x1={0.5}
            x2={44}
            y1={34.43}
            y2={34.43}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={iconColor} stopOpacity={0} />
            <stop offset={1} stopColor={iconColor} />
          </linearGradient>
          <linearGradient
            id={gradientIds.n}
            x1={0.5}
            x2={44}
            y1={34.43}
            y2={34.43}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={iconColor} stopOpacity={0} />
            <stop offset={1} stopColor={iconColor} />
          </linearGradient>
        </defs>
      </svg>
    </>
  );
};

export default SetIcon;

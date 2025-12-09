import svgPaths from "./svg-9f374ycx7i";
import img from "figma:asset/685e1c874d33b97ec46986ea2b9b2bf321a7a1d7.png";

function Frame() {
  return (
    <div className="h-[27px] relative shrink-0 w-full">
      <p className="absolute font-['Poppins:Regular',sans-serif] leading-[normal] left-0 not-italic text-[#999999] text-[16px] text-nowrap top-0 whitespace-pre">User name</p>
    </div>
  );
}

function TextField() {
  return (
    <div className="h-[56px] relative rounded-[12px] shrink-0 w-full" data-name="Text field">
      <div className="h-[56px] overflow-clip rounded-[inherit] w-full" />
      <div aria-hidden="true" className="absolute border border-[rgba(102,102,102,0.35)] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-[16.71%_12.08%_16.64%_12.14%]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 16">
        <g id="Group 1">
          <path d={svgPaths.p23cd5700} fill="var(--fill-0, #FFF41D)" id="Vector" />
          <path d={svgPaths.p25586b00} fill="var(--fill-0, #FFF41D)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function PasswordHideSee() {
  return (
    <div className="absolute contents right-[8.86px] top-0" data-name="Password hide / see">
      <div className="absolute opacity-75 overflow-clip right-[57.86px] size-[24px] top-[3px]" data-name="icon">
        <Group />
      </div>
      <p className="absolute font-['Poppins:Regular',sans-serif] leading-[normal] not-italic opacity-75 right-[8.86px] text-[#fff41d] text-[18px] text-nowrap text-right top-0 whitespace-pre">Hide</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="h-[27px] relative shrink-0 w-full">
      <p className="absolute font-['Poppins:Regular',sans-serif] leading-[normal] left-0 not-italic text-[#999999] text-[16px] text-nowrap top-0 whitespace-pre">Password</p>
      <PasswordHideSee />
    </div>
  );
}

function TextField1() {
  return (
    <div className="h-[56px] relative rounded-[12px] shrink-0 w-full" data-name="Text field">
      <div className="h-[56px] overflow-clip rounded-[inherit] w-full" />
      <div aria-hidden="true" className="absolute border border-[rgba(153,153,153,0.35)] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0">
      <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-[580px]" data-name="Text field">
        <Frame1 />
        <TextField1 />
      </div>
      <div className="box-border content-stretch flex gap-[8px] items-start pl-0 pr-[8px] py-[8px] relative shrink-0" data-name="Check box">
        <div className="opacity-75 overflow-clip relative shrink-0 size-[24px]" data-name="Check box">
          <div className="absolute inset-0" data-name="Vector">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
              <g id="Vector"></g>
            </svg>
          </div>
          <div className="absolute inset-[12.5%]" data-name="Vector">
            <div className="absolute inset-0" style={{ "--fill-0": "rgba(255, 244, 29, 1)" } as React.CSSProperties}>
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
                <path d={svgPaths.pae529f2} fill="var(--fill-0, #FFF41D)" id="Vector" />
              </svg>
            </div>
          </div>
        </div>
        <p className="font-['Poppins:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#aaaaaa] text-[16px] text-nowrap whitespace-pre">Remember me</p>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="absolute content-stretch flex gap-[8px] items-center justify-center left-1/2 top-[calc(50%-0.5px)] translate-x-[-50%] translate-y-[-50%]">
      <div className="flex flex-col font-['Poppins:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#111111] text-[22px] text-center text-nowrap">
        <p className="leading-[normal] whitespace-pre">Log in</p>
      </div>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0">
      <div className="box-border content-stretch flex gap-[10px] items-start px-0 py-[8px] relative shrink-0 w-[505px]" data-name="link text">
        <p className="font-['Poppins:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#666666] text-[0px] text-[16px] text-nowrap whitespace-pre">
          <span className="text-[#aaaaaa]">{`By continuing, you agree to the `}</span>
          <span className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid text-[#bbbbbb] underline">Terms of use 123</span> <span className="text-[#aaaaaa]">and</span> <span className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid text-[#bbbbbb] underline">Privacy Policy.</span>
          <span className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid underline"> </span>
        </p>
      </div>
      <div className="bg-[#fff41d] h-[64px] opacity-75 overflow-clip relative rounded-[12px] shrink-0 w-[580px]" data-name="Button">
        <Frame2 />
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0">
      <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-[580px]" data-name="Email">
        <Frame />
        <TextField />
      </div>
      <Frame3 />
      <Frame6 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-start justify-center relative shrink-0">
      <div className="flex flex-col font-['Poppins:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#aaaaaa] text-[32px] text-center text-nowrap">
        <p className="leading-[normal] whitespace-pre">Log in</p>
      </div>
      <Frame4 />
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center justify-end relative shrink-0">
      <div className="box-border content-stretch flex gap-[10px] items-start p-[2px] relative shrink-0" data-name="Have an account login">
        <p className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#aaaaaa] text-[16px] text-nowrap underline whitespace-pre">Forget your password</p>
      </div>
      <div className="box-border content-stretch flex gap-[10px] items-start p-[2px] relative shrink-0" data-name="Have an account login">
        <p className="font-['Poppins:Regular',sans-serif] leading-[normal] not-italic opacity-75 relative shrink-0 text-[#666666] text-[0px] text-[16px] text-nowrap whitespace-pre">
          <span className="text-white">Don’t have an account?</span> <span className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid font-['Poppins:Medium',sans-serif] text-[#fff41d] underline">{`Sign up  `}</span>
        </p>
      </div>
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center justify-center relative shrink-0">
      <Frame5 />
      <Frame7 />
    </div>
  );
}

function Frame9() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[48px] items-start left-[430px] top-[233px]">
      <Frame8 />
    </div>
  );
}

export default function Login() {
  return (
    <div className="bg-gradient-to-b from-[rgba(0,0,0,0.2)] relative size-full to-[rgba(114,110,20,0.2)]" data-name="login">
      <div className="relative size-full">
        <Frame9 />
        <div className="absolute h-[100px] left-0 top-0 w-[1440px]" data-name="nav bar guest">
          <div className="absolute bg-[#101010] inset-0 opacity-90" data-name="nav bar">
            <div aria-hidden="true" className="absolute border-[#666666] border-[0px_0px_1px] border-solid bottom-[-1px] left-0 pointer-events-none right-0 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-0" />
          </div>
          <div className="absolute aspect-[207/70] left-[13.96%] right-[71.67%] top-[15px]" data-name="logo button 1">
            <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={img} />
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none" />
    </div>
  );
}
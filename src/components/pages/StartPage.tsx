import imgCards1 from "figma:asset/66c581580b07ce11ba4bb026b6c21cd875a941fe.png";

interface StartPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export function StartPage({ onGetStarted, onLogin }: StartPageProps) {
  return (
    <div className="bg-[#111111] relative size-full" data-name="start page">
      <div className="relative size-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-8 mt-[100px]">
          <div className="flex flex-col items-center gap-12">
            <div className="w-[371px] h-[313px]" data-name="cards 1">
              <img alt="Learning cards" className="w-full h-full object-cover pointer-events-none" src={imgCards1} />
            </div>
            <div className="flex flex-col font-['Poppins:ExtraBold',sans-serif] justify-center leading-[normal] not-italic text-[36px] text-center text-white">
              <p className="mb-0">The fun and new way to</p>
              <p>learn dev skills!</p>
            </div>
          </div>
          <div className="flex flex-col gap-8 w-[400px]">
            <button 
              onClick={onGetStarted}
              className="bg-[#fff41d] h-[64px] opacity-75 rounded-[12px] shadow-[0px_4px_4px_0px_rgba(221,221,221,0.25)] hover:opacity-100 transition-opacity cursor-pointer border-none" 
              data-name="start button"
            >
              <div className="flex flex-col font-['Poppins:Medium',sans-serif] justify-center leading-[0] not-italic text-[22px] text-black text-center text-nowrap">
                <p className="leading-[normal] whitespace-pre">Get Started</p>
              </div>
            </button>
            <button
              onClick={onLogin}
              className="h-[64px] opacity-75 rounded-[12px] hover:opacity-100 transition-opacity cursor-pointer bg-transparent border-2 border-[#666666] border-solid shadow-[0px_4px_4px_0px_rgba(221,221,221,0.25)]"
              data-name="login button"
            >
              <div className="flex flex-col font-['Poppins:Medium',sans-serif] justify-center leading-[0] not-italic text-[22px] text-center text-nowrap text-white">
                <p className="leading-[normal] whitespace-pre">I already have an account</p>
              </div>
            </button>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none" />
    </div>
  );
}
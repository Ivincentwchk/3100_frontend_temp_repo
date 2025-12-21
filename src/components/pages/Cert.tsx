import React from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import headsign from '../../assets/headsign.png'
import logo from '../../assets/logo.png'
import certbottom from '../../assets/certbottom.png'

const Cert = () => {
  const handleDownloadPdf = async () => {
    const element = document.getElementById('PDF')
  if (!element) return
  const canvas = await html2canvas(element, { scale: 2 })
  const imgData = canvas.toDataURL('image/png')
  const imgWidth = canvas.width
  const imgHeight = canvas.height
  // target page ratio: width : height = 4 : 5  (similar to 60vw : 75vh)
  const pageHeight = 210 // mm, pick any height you like (e.g. 200, 210, 250)
  const pageWidth = (120 / 75) * pageHeight
  const pdf = new jsPDF('l', 'mm', [pageWidth, pageHeight])
  // fit image into page while keeping aspect ratio
  const imgRatio = imgWidth / imgHeight
  const pageRatio = pageWidth / pageHeight
  let drawWidth = pageWidth
  let drawHeight = pageHeight
  if (imgRatio > pageRatio) {
    // image is “wider” relative to height → fit width
    drawWidth = pageWidth
    drawHeight = pageWidth / imgRatio
  } else {
    // image is “taller” → fit height
    drawHeight = pageHeight
    drawWidth = pageHeight * imgRatio
  }
  // center on the page
  const x = (pageWidth - drawWidth) / 2
  const y = (pageHeight - drawHeight) / 2
  pdf.addImage(imgData, 'PNG', x, y, drawWidth, drawHeight)
  pdf.save('certificate.pdf')
 
  }

  return (
    <div className=' my-[100px] w-[120vh] text-black m-auto pt-8'>
      <button
        id="button"
        className='px-6 py-2 mb-4 text-sm font-semibold tracking-wide text-[#3b2a00] bg-[#ffe08a] border border-[#e0b94c] rounded-full shadow-sm hover:bg-[#ffd25a] hover:border-[#d1a634] active:bg-[#f0b93a] transition-colors duration-150 cursor-pointer'
        onClick={handleDownloadPdf}
      >
        Download as PDF
      </button>
      <div id='PDF' className='flex justify-center bg-[#fff6da] p-4 pb-8 px-8 h-[75vh] rounded-xl'>
        <div className='w-[40%] flex flex-col justify-center text-center'>
          <h2 className='text-2xl pt-8 mb-10'>Condingo</h2>
          <p>
            <span className='block'>Certifies that</span>
            <span className='block'>username</span>
            <span className='block'>has completed courses:</span>
            <span className='block'>Advanced Git</span>
          </p>
          <h3 className='text-lg mt-4'>Master of Git</h3>
          <p>dated 19 December 2025</p>
          <img src={headsign} alt="" className='max-w-[160px] block m-auto' />
          <p>Signature of department head</p>
        </div>
        <div className='w-[20%] flex flex-col'>
          <img src={logo} alt="" className=' block m-0' />
          <p style={{/*writingMode: 'vertical-rl'*/}} className='m-auto text-lg w-1 leading-5'>公元二零二五年十二月十九日</p>
          <img src={certbottom} alt="" className='max-w-24 m-auto' />
        </div>
        <div className='w-[40%] flex flex-col justify-center text-center'>
          <h2 className='text-2xl mb-6 pt-6'>
            （射影無譯音）狗定曲
          </h2>
          <p style={{/*writingMode: 'vertical-rl'*/}} className='text-justify'>
            大寶冰室確實係全亞洲最優秀嘅肉餅飯 塊肉餅大撚過我塊面，仲要有兩塊 表皮香脆金黃，啲梅納反應煎到啱啱好 咬落去脆口得嚟入邊卻又鬆化至極 肉感飽滿而不肥膩 啲肉唔會剁到爛蓉蓉，仲保留到少少豬肉粒同明顯食到魷魚粒嘅彈牙口感，層次分明 豬肉粒嘅鬆軟同魷魚嘅彈牙鮮爽兩種口感一前一後好似交響樂咁一層一層推上嚟，完全唔會搶戲，和諧到一個點￼ ￼調味方面更加係畫龍點睛 咸香入味之餘仲帶住魷魚粒本身嗰陣鮮甜，￼好似海風一陣陣咁由舌尖直吹到腦門，啱啱好唔會過甜，完美襯托到豬肉嘅油香 雖然肉餅表面油光可鑒，但真係落口嗰陣時又肥而不膩，脂香滿口 原諒小弟文筆唔好，描繪唔到大bro￼肉餅飯嘅神髓 只可以講 元朗大寶冰室，全亞洲最優秀嘅肉餅飯，大件夾抵食 鄰近西鐵站，巴士總站，交通方便

          </p>
        </div>
      </div>
    </div>
  )
}

export default Cert
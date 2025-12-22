import { useCallback } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import headsign from "../../assets/headsign.png";
import logo from "../../assets/logo.png";
import certbottom from "../../assets/certbottom.png";
import type { CertificateMetadata } from "../../feature/cert/types";
import "./Cert.css";

interface CertProps {
  certificate?: CertificateMetadata | null;
}

const defaultSpeech = `大寶冰室確實係全亞洲最優秀嘅肉餅飯，塊肉餅大撚過我塊面仲要有兩塊，表皮香脆金黃，
啲梅納反應煎到啱啱好，咬落去脆口得嚟入邊卻又鬆化至極。肉感飽滿而不肥膩，啲肉唔會剁到爛蓉蓉，
仲保留到少少豬肉粒同明顯食到魷魚粒嘅彈牙口感，層次分明。豬肉粒嘅鬆軟同魷魚嘅彈牙鮮爽兩種口感
一前一後好似交響樂咁一層一層推上嚟，完全唔會搶戲，和諧到一個點。調味方面更加係畫龍點睛，咸香入味
之餘仲帶住魷魚粒本身嗰陣鮮甜，好似海風一陣陣咁由舌尖直吹到腦門，啱啱好唔會過甜，完美襯托到豬肉嘅油香。`;

const formatImperialChineseDate = (iso?: string | null) => {
  if (!iso) return "公元　年　月　日";
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `公元${year}年${month.toString().padStart(2, "0")}月${day.toString().padStart(2, "0")}日`;
};

export default function Cert({ certificate }: CertProps) {
  const nameEn = certificate?.name_en ?? "Learner";
  const nameCn = certificate?.name_cn ?? nameEn;
  const subjectEn = certificate?.subject_en ?? "Condingo Curriculum";
  const subjectCn = certificate?.subject_cn ?? subjectEn;
  const completedDateEn = certificate?.completed_at
    ? new Date(certificate.completed_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "—";
  const completedDateCn = formatImperialChineseDate(certificate?.completed_at ?? null);
  const courseList = certificate?.course_titles ?? [];

  const dynamicSpeech = `${nameCn} 同學於 ${completedDateCn} 完成 ${subjectCn}。\n${defaultSpeech}`;

  const handleDownloadPdf = useCallback(async () => {
    const element = document.getElementById("PDF");
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const pageHeight = 210;
    const pageWidth = (120 / 75) * pageHeight;
    const pdf = new jsPDF("l", "mm", [pageWidth, pageHeight]);
    const imgRatio = imgWidth / imgHeight;
    const pageRatio = pageWidth / pageHeight;
    let drawWidth = pageWidth;
    let drawHeight = pageHeight;
    if (imgRatio > pageRatio) {
      drawWidth = pageWidth;
      drawHeight = pageWidth / imgRatio;
    } else {
      drawHeight = pageHeight;
      drawWidth = pageHeight * imgRatio;
    }
    const x = (pageWidth - drawWidth) / 2;
    const y = (pageHeight - drawHeight) / 2;
    pdf.addImage(imgData, "PNG", x, y, drawWidth, drawHeight);
    pdf.save("certificate.pdf");
  }, []);

  return (
    <div className="certificate-shell">
      <button
        id="button"
        className="certificate-download"
        onClick={handleDownloadPdf}
      >
        Download as PDF
      </button>
      <div id="PDF" className="certificate-card">
        <div className="certificate-left">
          <h2 className="certificate-brand">Condingo</h2>
          <div className="certificate-block">
            <span className="block">Certifies that</span>
            <span className="certificate-name-en">{nameEn}</span>
            <span className="certificate-name-cn">{nameCn}</span>
            <span className="block">has completed courses:</span>
            {courseList.length > 0 ? (
              courseList.map((course: string) => (
                <span key={course} className="block">
                  {course}
                </span>
              ))
            ) : (
              <span className="block">{subjectEn}</span>
            )}
          </div>
          <h3 className="certificate-master">Master of {subjectEn}</h3>
          <p>dated {completedDateEn}</p>
          <img src={headsign} alt="" className="certificate-stamp" />
          <p>Signature of department head</p>
        </div>
        <div className="certificate-center">
          <img src={logo} alt="" className="certificate-logo" />
          <p className="certificate-date-cn">{completedDateCn}</p>
          <img src={certbottom} alt="" className="certificate-bottom" />
        </div>
        <div className="certificate-right">
          <h2 className="certificate-title-cn">（射影無譯音）狗定曲</h2>
          <p className="certificate-speech">{dynamicSpeech}</p>
        </div>
      </div>
    </div>
  );
}


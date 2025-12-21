import imgCards1 from "figma:asset/66c581580b07ce11ba4bb026b6c21cd875a941fe.png";
import "./StartPage.css";

interface StartPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export function StartPage({ onGetStarted, onLogin }: StartPageProps) {
  return (
    <div className="start-page" data-name="start page">
      <div className="start-page__inner">
        <div className="start-page__hero">
          <div className="start-page__card" data-name="cards 1">
            <img alt="Learning cards" className="start-page__card-image" src={imgCards1} />
          </div>
          <div className="start-page__heading">
            <p>The fun and new way to</p>
            <p>learn dev skills!</p>
          </div>
        </div>

        <div className="start-page__actions">
          <button type="button" onClick={onGetStarted} className="start-page__btn start-page__btn-primary">
            Get Started
          </button>

          <button type="button" onClick={onLogin} className="start-page__btn start-page__btn-secondary">
            I already have an account
          </button>
        </div>
      </div>
    </div>
  );
}
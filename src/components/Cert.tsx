import React from 'react'
import { usePDF } from 'react-to-pdf'

const Cert = () => {
  const { toPDF, targetRef } = usePDF({ filename: 'test.pdf' })

  return (
    <div className="certificate-page">
      <h1 className="certificate-heading">CERT PDF TEST</h1>
      <button className="certificate-download-btn" onClick={() => toPDF()}>
        download pdf
      </button>

      <div ref={targetRef} className="certificate-card">
        <h1 className="certificate-title">GIT Certificate</h1>
        <h2 className="certificate-subtitle">the username</h2>
        <h3 className="certificate-meta">
          Completed: the date completed subject
        </h3>
      </div>
    </div>
  )
}

export default Cert
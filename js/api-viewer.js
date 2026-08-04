/* ==========================================================================
   DEVELOPER API CODE SNIPPET VIEWER
   ========================================================================== */

const CODE_SNIPPETS = {
  python: `<span class="code-cmt"># Python SDK: BharatSign AI YOLOv8 Real-Time Inference</span>
<span class="code-kw">import</span> cv2
<span class="code-kw">from</span> bharatsign <span class="code-kw">import</span> IndianSignDetector

<span class="code-cmt"># Initialize TensorRT FP16 Quantized Engine</span>
detector = IndianSignDetector(
    model_path=<span class="code-str">"weights/yolov8_itsrd_fp16.engine"</span>,
    conf_thresh=<span class="code-num">0.75</span>,
    device=<span class="code-str">"cuda:0"</span>
)

<span class="code-cmt"># Capture Real-Time Stream (Webcam / Dashcam)</span>
cap = cv2.VideoCapture(<span class="code-num">0</span>)

<span class="code-kw">while</span> cap.isOpened():
    ret, frame = cap.read()
    <span class="code-kw">if not</span> ret: <span class="code-kw">break</span>

    <span class="code-cmt"># Perform High-Speed Sign Detection & Classification</span>
    results = detector.detect(frame)

    <span class="code-kw">for</span> sign <span class="code-kw">in</span> results.detections:
        print(<span class="code-str">f"Sign: {sign.name} | Code: {sign.irc_code} | Conf: {sign.confidence:.2f}"</span>)
        <span class="code-kw">if</span> sign.is_mandatory:
            detector.trigger_audio_alert(sign.voice_prompt)

    <span class="code-cmt"># Draw Cyber Bounding Boxes</span>
    annotated_frame = detector.draw_hud(frame, results)
    cv2.imshow(<span class="code-str">"NavDrishti AI Telemetry"</span>, annotated_frame)`,

  curl: `<span class="code-cmt"># REST API Endpoint: Process Single Traffic Frame</span>
curl -X POST <span class="code-str">"https://api.bharatsign.ai/v1/detect"</span> \\
  -H <span class="code-str">"Authorization: Bearer BS_LIVE_KEY_99X"</span> \\
  -H <span class="code-str">"Content-Type: application/json"</span> \\
  -d '{
    <span class="code-str">"image_base64"</span>: <span class="code-str">"iVBORw0KGgoAAAANSUhEUgAA..."</span>,
    <span class="code-str">"conf_threshold"</span>: <span class="code-num">0.75</span>,
    <span class="code-str">"include_mv_act_fines"</span>: <span class="code-kw">true</span>
  }'

<span class="code-cmt"># Response Payload (JSON)</span>
{
  <span class="code-str">"status"</span>: <span class="code-str">"success"</span>,
  <span class="code-str">"latency_ms"</span>: <span class="code-num">11.4</span>,
  <span class="code-str">"detections"</span>: [
    {
      <span class="code-str">"class_id"</span>: <span class="code-str">"M-04"</span>,
      <span class="code-str">"name"</span>: <span class="code-str">"Speed Limit 50 km/h"</span>,
      <span class="code-str">"confidence"</span>: <span class="code-num">0.984</span>,
      <span class="code-str">"bbox"</span>: [<span class="code-num">140</span>, <span class="code-num">85</span>, <span class="code-num">290</span>, <span class="code-num">235</span>],
      <span class="code-str">"mv_act_fine"</span>: <span class="code-str">"₹1,000 - ₹2,000"</span>
    }
  ]
}`,

  cpp: `<span class="code-cmt">// C++ TensorRT Edge Pipeline for Jetson Nano / Orin</span>
<span class="code-kw">#include</span> <span class="code-str">&lt;bharatsign/detector.hpp&gt;</span>
<span class="code-kw">#include</span> <span class="code-str">&lt;opencv2/opencv.hpp&gt;</span>

<span class="code-kw">int</span> main() {
    bharatsign::Config config;
    config.engine_path = <span class="code-str">"yolov8_itsrd.engine"</span>;
    config.precision = bharatsign::Precision::FP16;

    bharatsign::DetectorEngine detector(config);
    cv::Mat frame = cv::imread(<span class="code-str">"test_road.jpg"</span>);

    <span class="code-kw">auto</span> results = detector.infer(frame);
    std::cout &lt;&lt; <span class="code-str">"Detected Signs Count: "</span> &lt;&lt; results.size() &lt;&lt; std::endl;
    <span class="code-kw">return</span> <span class="code-num">0</span>;
}`
};

function initApiViewer() {
  const codeContainer = document.getElementById('apiCodeDisplay');
  const tabBtns = document.querySelectorAll('.code-tab-btn');
  const copyBtn = document.getElementById('copyCodeBtn');

  if (!codeContainer) return;

  function setLanguage(lang) {
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    codeContainer.innerHTML = CODE_SNIPPETS[lang] || CODE_SNIPPETS.python;
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const activeTab = document.querySelector('.code-tab-btn.active');
      const lang = activeTab ? activeTab.dataset.lang : 'python';
      const tempTextArea = document.createElement('textarea');
      tempTextArea.value = CODE_SNIPPETS[lang].replace(/<[^>]*>/g, ''); // Strip HTML tags
      document.body.appendChild(tempTextArea);
      tempTextArea.select();
      document.execCommand('copy');
      document.body.removeChild(tempTextArea);

      const origText = copyBtn.innerHTML;
      copyBtn.innerHTML = `✓ Copied`;
      setTimeout(() => copyBtn.innerHTML = origText, 2000);
    });
  }

  setLanguage('python');
}

window.addEventListener('DOMContentLoaded', initApiViewer);

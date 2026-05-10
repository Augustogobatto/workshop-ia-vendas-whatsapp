const BoxLoader = () => (
  <>
    <style>{`
      .box-loader-scene {
        --size: 28px;
        --duration: 800ms;
        display: flex;
        align-items: center;
        justify-content: center;
        padding-top: calc(var(--size) * 1.5);
      }
      .box-loader-wrap {
        height: calc(var(--size) * 2);
        width: calc(var(--size) * 3);
        position: relative;
        transform-style: preserve-3d;
        transform-origin: 50% 50%;
        margin-top: calc(var(--size) * 1.5 * -1);
        transform: rotateX(60deg) rotateZ(45deg) rotateY(0deg) translateZ(0px);
      }
      .bl-box {
        width: var(--size);
        height: var(--size);
        top: 0;
        left: 0;
        position: absolute;
        transform-style: preserve-3d;
      }
      .bl-box-1 { transform: translate(100%, 0); animation: blBox1 var(--duration) linear infinite; }
      .bl-box-2 { transform: translate(0, 100%); animation: blBox2 var(--duration) linear infinite; }
      .bl-box-3 { transform: translate(100%, 100%); animation: blBox3 var(--duration) linear infinite; }
      .bl-box-4 { transform: translate(200%, 0); animation: blBox4 var(--duration) linear infinite; }
      .bl-face {
        position: absolute;
        width: var(--size);
        height: var(--size);
      }
      .bl-face-front { background: var(--green);                    transform: translateZ(calc(var(--size) / 2)); }
      .bl-face-back  { background: var(--green);                    transform: rotateY(180deg) translateZ(calc(var(--size) / 2)); }
      .bl-face-right { background: rgba(255,255,255,0.5);           transform: rotateY(90deg) translateZ(calc(var(--size) / 2)); }
      .bl-face-top   { background: rgba(255,255,255,0.75);          transform: rotateX(90deg) translateZ(calc(var(--size) / 2)); }
      @keyframes blBox1 {
        0%, 50% { transform: translate(100%, 0); }
        100%    { transform: translate(200%, 0); }
      }
      @keyframes blBox2 {
        0%   { transform: translate(0, 100%); }
        50%  { transform: translate(0, 0); }
        100% { transform: translate(100%, 0); }
      }
      @keyframes blBox3 {
        0%, 50% { transform: translate(100%, 100%); }
        100%    { transform: translate(0, 100%); }
      }
      @keyframes blBox4 {
        0%   { transform: translate(200%, 0); }
        50%  { transform: translate(200%, 100%); }
        100% { transform: translate(100%, 100%); }
      }
    `}</style>
    <div className="box-loader-scene">
      <div className="box-loader-wrap">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className={`bl-box bl-box-${n}`}>
            <div className="bl-face bl-face-front" />
            <div className="bl-face bl-face-right" />
            <div className="bl-face bl-face-top" />
            <div className="bl-face bl-face-back" />
          </div>
        ))}
      </div>
    </div>
  </>
)

export default BoxLoader

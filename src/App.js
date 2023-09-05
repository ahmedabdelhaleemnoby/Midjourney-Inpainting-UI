import React, { useEffect, useState, useRef } from "react";
import createLasso from "lasso-canvas-image";
import "./App.css";

function App() {
  const imageRef = useRef();
  const polygonRef = useRef();
  const lassoRef = useRef();
  const canvasRef = useRef(); // 新增加一个引用
  const [imgLoaded, setImageLoaded] = useState(false);
  const [base64Image, setBase64Image] = useState(["", ""]);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState("");

  const copyToClipboard = () => {
    navigator.clipboard.writeText(base64Image).then(
      () => {
        setCopySuccess("Copied!");
      },
      () => {
        setCopySuccess("Failed to copy!");
      }
    );
  };

  const handleUrlChange = (event) => {
    setError(null);
    const newUrl = event.target.value;

    try {
      if (newUrl.trim() === "") {
        handleClear(); // 清除url时，重置套索区域
      }
      new URL(newUrl); // 测试URL是否有效
      setImageUrl(newUrl);
      setImageLoaded(false); // 当URL改变时，设置imgLoaded为false
    } catch {
      setError("Invalid URL!"); // 如果URL无效，就设置错误信息
    }
  };

  const handleImageError = () => {
    if (imageUrl !== "") {
      setError("Image failed to load, Please check the URL");
      handleClear();
    }
  };

  const handleClear = () => {
    setImageUrl("");
    // 在这里判断图片加载是否完成以及是否存在加载错误
    if (
      imageRef.current &&
      imageRef.current.complete &&
      imageRef.current.naturalHeight !== 0
    ) {
      lassoRef.current && lassoRef.current.reset();
    }

    setBase64Image(["", ""]);

    setImageLoaded(false);
  };

  const resetLasso = () => {
    lassoRef.current.reset();
    setBase64Image(["", ""]);
  };

  const resetImage = () => {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    const lassoCanvas = document.getElementById("lassoCanvas");
    if (image && !error) {
      if (canvas) {
        canvas.width = image.width; // 设置 canvas 宽度
        canvas.height = image.height;
      }
      if (lassoCanvas) {
        lassoCanvas.width = image.width;
        lassoCanvas.height = image.height;
      }
    }
  };

  const createLassoCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "black"; // 设置填充颜色为黑色
    ctx.fillRect(0, 0, canvas.width, canvas.height); // 填充整个 canvas

    lassoRef.current = createLasso({
      element: imageRef.current,
      onUpdate(polygon) {
        if (polygonRef.current && typeof polygon === "string") {
          polygonRef.current.setAttribute("points", polygon);

          // 将polygon字符串转为坐标数组
          const coordinates = polygon
            .split(" ")
            .map((point) => point.split(",").map(Number));

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "black";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.beginPath();
          for (let i = 0; i < coordinates.length; i++) {
            const [x, y] = coordinates[i];
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fillStyle = "white";
          ctx.fill();
          const base64Image = canvas.toDataURL("image/webp"); // 把 canvas 转为 base64 格式的图片
          setBase64Image(base64Image.split(","));
        }
      },
    });

    const allCanvas = document.querySelectorAll("canvas");
    const lassoCanvas = allCanvas[0];
    if (lassoCanvas && lassoCanvas !== canvas) {
      // 额外检查以确保我们不会误操作已有的 canvas
      lassoCanvas.id = "lassoCanvas";
    }
  };

  useEffect(() => {
    resetImage();
    if (imgLoaded && imageRef.current && imageRef.current.parentElement) {
      setTimeout(() => {
        // 需要再次确认 img 还在 DOM 中
        if (document.body.contains(imageRef.current)) {
          createLassoCanvas();
        }
      }, 0)
    }
  }, [imgLoaded, imageUrl]); // Run the effect again if imgLoaded changes.

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlImage = params.get("imageUrl");

    const timer = setTimeout(() => {
      setImageUrl(urlImage || "");
    }, 1000); // 这里1000是毫秒数，代表1秒后运行

    return () => clearTimeout(timer); // 改变的 cleanup 函数会在组件 unmount 时运行或者在下一次重新运行 effect 之前运行
  }, []);

  return (
    <div className="app-container">
      <div className="input-container">
        <input
          className="url-input"
          type="text"
          placeholder="Enter image URL"
          value={imageUrl}
          onChange={handleUrlChange}
        />
        <button className="btn" onClick={handleClear}>
          Clear Url
        </button>
      </div>
      {imageUrl && error && <p className="error-message">{error}</p>}
      <img
        className="image"
        ref={imageRef}
        onLoad={() => {
          setImageLoaded(true);
        }}
        src={imageUrl}
        onError={handleImageError}
        alt="Your Image"
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <div>
        <button className="btn reset-btn" onClick={resetLasso}>
          Reset Lasso
        </button>
      </div>

      {base64Image[0] && (
        <div className="base64-container">
          <code className="base64-code">{base64Image[0]}</code>
        </div>
      )}

      <div className="copy-container">
        <button className="btn copy-btn" onClick={copyToClipboard}>
          Copy
        </button>
        <span className="copy-success-span">{copySuccess}</span>
      </div>

      <div className="base64-container">
        <code className="base64-code">{base64Image[1]}</code>
      </div>
      <svg width="0" height="0">
        <polygon ref={polygonRef} points="" style={{ display: "none" }} />
      </svg>
    </div>
  );
}

export default App;

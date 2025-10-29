import { useState, useRef } from "react";
import zxcvbn from "zxcvbn";
import { checkPasswordStrength } from "./pwdStrength";
import { Eye, EyeOff } from "lucide-react";

const bgImage = "/bg-layout.png";

export default function App() {
  const [activePanel, setActivePanel] = useState("checker"); // ✅ toggle between panels

  return (
    <>
      {activePanel === "checker" ? (
        <PasswordChecker onSwitch={() => setActivePanel("generator")} />
      ) : (
        <PasswordGenerator onSwitch={() => setActivePanel("checker")} />
      )}
    </>
  );
}

/* ============================================================
   ✅ PASSWORD STRENGTH CHECKER (Your exact version)
============================================================ */
function PasswordChecker({ onSwitch }) {
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [result, setResult] = useState(null);
  const [tips, setTips] = useState([]);
  const [scanning, setScanning] = useState(false);
  const inputRef = useRef(null);

  const computeTips = (pwd) => {
    const jsTips = [];
    if (pwd.length < 8) jsTips.push("❗ Password too short (min 8 characters).");
    if (!/[A-Z]/.test(pwd)) jsTips.push("Add at least one uppercase letter (A–Z).");
    if (!/[a-z]/.test(pwd)) jsTips.push("Add at least one lowercase letter (a–z).");
    if (!/[0-9]/.test(pwd)) jsTips.push("Include a number (0–9).");
    if (!/[^A-Za-z0-9]/.test(pwd)) jsTips.push("Include a special character (e.g., @, #, !).");
    return jsTips;
  };

  const handleScan = async () => {
    if (!password) return;
    setScanning(true);
    try {
      const wasmResult = await checkPasswordStrength(password);
      const z = zxcvbn(password);
      setResult({ wasm: wasmResult, zxcvbn: z });
      setTips(computeTips(password));
    } catch (e) {
      console.error(e);
      alert("Error running WASM code. Check console for details.");
    } finally {
      setTimeout(() => setScanning(false), 300);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleScan();
  };

  const getStrengthColor = (score) =>
    ["bg-red-500", "bg-orange-500", "bg-yellow-400", "bg-green-400", "bg-emerald-600"][score] ||
    "bg-gray-500";

  const getStrengthLabel = (score) =>
    ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"][score] || "Unknown";

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center text-white overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        backgroundColor: "#1f1f1f",
      }}
    >
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 w-full max-w-3xl mx-auto p-8 rounded-2xl bg-gray-900/60 backdrop-blur-sm border border-gray-700 shadow-2xl flex flex-col justify-center">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-center text-cyan-300 flex items-center justify-center gap-3">
          <span>🔒</span>
          <span>Password Strength Tester</span>
          <span className="text-sm text-gray-300 ml-2">(Rust + WASM + zxcvbn)</span>
        </h1>

        {/* === Input + Button === */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 relative">
          <div className="relative flex-1 w-full">
            <input
              ref={inputRef}
              type={showPwd ? "text" : "password"}
              placeholder="Enter password and press Enter or click Check"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 pr-10 rounded-lg bg-gray-950/70 border border-gray-700 text-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-cyan-400 outline-none transition"
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition"
            >
              {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            onClick={handleScan}
            className={`px-5 py-3 rounded-lg text-white font-semibold transform transition-all shadow-md ${
              scanning
                ? "bg-gradient-to-r from-gray-600 to-gray-500 scale-95"
                : "bg-cyan-500 hover:bg-cyan-400 hover:scale-105"
            }`}
          >
            {scanning ? "Scanning…" : "Check"}
          </button>
        </div>

        {/* === Add redirect button === */}
        <div className="text-center mb-6">
          <button
            onClick={onSwitch}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-semibold shadow-md transition-all hover:scale-105"
          >
            Go to Password Generator ⚙️
          </button>
        </div>

        {/* === Results Section === */}
        {result && (
          <div className="bg-gray-800/70 p-5 rounded-xl shadow-inner border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-cyan-200">Result</h2>
              <div className="flex items-center gap-4">
                <div className="h-3 w-40 rounded-full bg-gray-700 overflow-hidden">
                  <div
                    className={`${getStrengthColor(result.zxcvbn.score)} h-full transition-all duration-500`}
                    style={{ width: `${(result.zxcvbn.score + 1) * 20}%` }}
                  />
                </div>
                <div className="text-sm font-semibold text-gray-200">
                  {getStrengthLabel(result.zxcvbn.score)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-300 mb-2">Rust WASM analysis</div>
                <pre className="bg-gray-950/80 text-xs text-gray-200 p-3 rounded-lg overflow-auto">
                  {JSON.stringify(result.wasm, null, 2)}
                </pre>
              </div>

              <div>
                <div className="text-xs text-gray-300 mb-2">Quick suggestions</div>
                {tips.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-amber-200 mb-3">
                    {tips.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   ✅ PASSWORD GENERATOR (Your exact version)
============================================================ */
function PasswordGenerator({ onSwitch }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [result, setResult] = useState(null);
  const [generated, setGenerated] = useState([]);
  const inputRef = useRef();

  const handleInput = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    setResult(zxcvbn(pwd));
  };

  const computeTips = (score) => {
    if (score === 0) return ["Way too weak. Try mixing uppercase, lowercase & symbols."];
    if (score === 1) return ["Add more length & include numbers or special characters."];
    if (score === 2) return ["Better, but still guessable. Add more random elements."];
    if (score === 3) return ["Almost there! Add one more twist for full strength."];
    if (score === 4) return ["Excellent! That's a very strong password."];
    return [];
  };

  const generateStrongPasswords = (base) => {
    if (!base || base.trim().length === 0) return [];
    const words = ["Secure", "Cipher", "Nova", "Quantum", "Shield", "Storm", "Titan", "Aegis"];
    const specials = ["!", "@", "#", "$", "%", "&", "*"];
    const nums = ["007", "99", "2025", "42", "88"];
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    const strengthen = (str) => {
      const map = { a: "@", s: "$", i: "1", o: "0", e: "3", l: "7" };
      return str
        .split("")
        .map((c) => (map[c.toLowerCase()] ? map[c.toLowerCase()] : c))
        .join("");
    };

    let results = [];
    for (let i = 0; i < 20 && results.length < 5; i++) {
      const word = words[Math.floor(Math.random() * words.length)];
      const num = nums[Math.floor(Math.random() * nums.length)];
      const sym = specials[Math.floor(Math.random() * specials.length)];
      const mix = [capitalize(base), word, num, sym].sort(() => 0.5 - Math.random()).join("");
      const strong = strengthen(mix);
      if (zxcvbn(strong).score >= 4 && !results.includes(strong)) {
        results.push(strong);
      }
    }
    return results;
  };

  const handleGenerate = () => {
    const variants = generateStrongPasswords(password);
    setGenerated(variants);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const StrengthBar = ({ score }) => {
    const getColor = (score) => {
      switch (score) {
        case 0:
          return "bg-red-600";
        case 1:
          return "bg-orange-500";
        case 2:
          return "bg-yellow-500";
        case 3:
          return "bg-lime-500";
        case 4:
          return "bg-green-500";
        default:
          return "bg-gray-700";
      }
    };
    return (
      <div className="w-full h-3 bg-gray-800 rounded-lg overflow-hidden mt-2">
        <div
          className={`h-3 transition-all duration-700 ${getColor(score)}`}
          style={{ width: `${((score + 1) / 5) * 100}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center bg-cover bg-center p-6 text-white"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="bg-black/60 p-8 rounded-2xl shadow-2xl w-full max-w-lg text-white backdrop-blur-md">
        <h1 className="text-3xl font-bold mb-4 text-center">🔐 Password Generator</h1>
        {/* === User Guidance Comment === */}
        <p className="text-sm text-gray-300 text-center mb-4">
          💡 <strong>Tip:</strong> Enter something personal but simple — like your name, pet name,
          or a memorable word. The generator will create <strong>strong, unique</strong> password
          variants based on it.
        </p>
        {/* Switch to checker */}
        <div className="text-center mb-4">
          <button
            onClick={onSwitch}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-semibold shadow-md transition-all hover:scale-105"
          >
            Go to Password Checker 🔍
          </button>
        </div>

        <div className="relative mb-4">
          <input
            ref={inputRef}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={handleInput}
            placeholder="Enter your base password"
            className="w-full px-4 py-3 bg-gray-900/70 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-200"
          >
            {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
          </button>
        </div>

        {result && (
          <div className="text-center">
            <p className="text-lg mb-2">
              Strength:{" "}
              <span
                className={
                  result.score === 4
                    ? "text-green-400"
                    : result.score === 3
                    ? "text-lime-400"
                    : result.score === 2
                    ? "text-yellow-400"
                    : result.score === 1
                    ? "text-orange-400"
                    : "text-red-400"
                }
              >
                {["Very Weak", "Weak", "Fair", "Good", "Strong"][result.score]}
              </span>
            </p>
            <StrengthBar score={result.score} />
            <ul className="text-sm text-gray-300 space-y-1 mt-3">
              {computeTips(result.score).map((tip, i) => (
                <li key={i}>💡 {tip}</li>
              ))}
            </ul>
          </div>
        )}

        {password && (
          <div className="mt-6 text-center">
            <button
              onClick={handleGenerate}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-all shadow-md hover:scale-105"
            >
              Generate Strong Passwords 💡
            </button>

            {generated.length > 0 && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {generated.map((p, i) => (
                  <div
                    key={i}
                    className="bg-gray-800/70 p-2 rounded-md border border-gray-700 text-sm font-mono text-cyan-200 break-all flex justify-between items-center hover:bg-gray-700/80 transition"
                  >
                    <span>{p}</span>
                    <button
                      onClick={() => copyToClipboard(p)}
                      className="text-gray-400 hover:text-white text-xs ml-2"
                    >
                      📋 Copy
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

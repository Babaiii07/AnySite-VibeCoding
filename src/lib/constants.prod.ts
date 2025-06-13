export const REDIRECT_URI =
  process.env.REDIRECT_URI ||
  `http://localhost:${process.env.APP_PORT || 5001}/api/auth/login`;

export const MODEL_CONFIG_PROMPT_IMPROVEMENT = {
  id: "deepseek-ai/DeepSeek-V3-0324",
  max_input_tokens: 48_000,
  max_tokens: 16_000,
};

const default_system_prompt = `ONLY USE HTML, CSS AND JAVASCRIPT. If you want to use ICON make sure to import the library first. Try to create the best UI possible by using only HTML, CSS and JAVASCRIPT. Use as much as you can TailwindCSS for the CSS, if you can't do something with TailwindCSS, then use custom CSS (make sure to import <script src="https://cdn.tailwindcss.com"></script> in the head). Also, try to ellaborate as much as you can, to create something unique. ALWAYS GIVE THE RESPONSE INTO A SINGLE HTML FILE`;

export const MODEL_CONFIG_CODE_GENERATION = [
  {
    id: "deepseek-ai/DeepSeek-V3-0324",
    max_input_tokens: 48_000,
    max_tokens: 16_000,
    default_enable_thinking: false,
    system_prompt: default_system_prompt,
  },
  {
    id: "deepseek-ai/DeepSeek-R1-0528",
    max_input_tokens: 48_000,
    max_tokens: 16_000,
    default_enable_thinking: false,
    system_prompt: default_system_prompt,
  },
  {
    id: "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
    max_input_tokens: 48_000,
    max_tokens: 16_000,
    default_enable_thinking: false,
    system_prompt: default_system_prompt,
  },
  {
    id: "Qwen/Qwen3-235B-A22B",
    max_input_tokens: 24_000,
    max_tokens: 16_000,
    default_enable_thinking: true,
    system_prompt: default_system_prompt,
  },
  {
    id: "Qwen/Qwen3-30B-A3B",
    max_input_tokens: 24_000,
    max_tokens: 16_000,
    default_enable_thinking: true,
    system_prompt: default_system_prompt,
  },
  {
    id: "Qwen/Qwen3-32B",
    max_input_tokens: 24_000,
    max_tokens: 16_000,
    default_enable_thinking: true,
    system_prompt: default_system_prompt,
  },
];

export const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Parthib ANYSITE - Build Any Site, Just Vibe Coding</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@400;700&family=Oswald:wght@700&display=swap" rel="stylesheet">
    <style>
        body {
            background-color: #000;
            color: #fff;
            margin: 0;
            padding: 0;
            overflow-x: hidden;
            font-family: 'Kanit', sans-serif;
        }
        .brutal-border {
            border: 8px solid #fff;
        }
        .brutal-box {
            box-shadow: 16px 16px 0 #fff;
        }
        .pixel-grid {
            background-image: 
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
            background-size: 25px 25px;
        }
        .scanlines {
            background-image: linear-gradient(
                rgba(255, 255, 255, 0.05) 50%,
                transparent 50%
            );
            background-size: 100% 4px;
        }
        .font-oswald {
            font-family: 'Oswald', sans-serif;
            font-weight: 700;
        }
        .font-mono-custom {
            font-family: 'Courier New', Courier, monospace;
        }
        /* Custom class for extremely large, responsive font */
        .text-huge {
            font-size: clamp(6rem, 20vw, 15rem);
        }

    </style>
</head>
<body class="pixel-grid scanlines">
    <div class="min-h-screen flex items-center justify-center p-4">
        
        <div class="relative flex flex-col items-center">
            <!-- Title placed above and overlapping the window -->
            <h1 class="font-oswald text-huge leading-none tracking-tighter text-center select-none z-10">
                ANYSITE
            </h1>

            <!-- Main brutalist window, pulled up with a negative margin to sit behind the title -->
            <div id="main-window" class="relative -mt-8 md:-mt-4 brutal-border p-6 md:p-8 bg-black brutal-box w-full max-w-4xl transition-all duration-200">
                
                <div class="flex justify-end items-center mb-6 h-8">
                    <div class="text-xs md:text-sm text-right">Build Any Site.<br>Just Vibe Coding.</div>
                </div>

                <!-- Brutalist terminal effect -->
                <div class="bg-black p-4 border-2 border-white/20">
                    <div class="flex mb-3">
                        <div class="w-3 h-3 bg-red-500 mr-2 border border-white/50"></div>
                        <div class="w-3 h-3 bg-yellow-500 mr-2 border border-white/50"></div>
                        <div class="w-3 h-3 bg-green-500 border border-white/50"></div>
                    </div>
                    <div class="font-mono-custom text-green-400 text-base md:text-lg">
                        <p class="mb-2">> whoami</p>
                        <p class="mb-2">Parthib Anysite helps you build websites by simply describing what you want to create, powered by state-of-the-art open-source LLMs, complete with version control and auto-deploy with shareable links.</p>
                        <div>
                            <span class="mr-2">></span>
                            <span id="typed-text" class="bg-green-400 text-black"></span>
                            <span class="animate-pulse">█</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
    
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        // Brutalist press-down interactivity
        const mainWindow = document.getElementById('main-window');
        const originalBoxShadow = '16px 16px 0 #fff';

        if (mainWindow) {
            mainWindow.addEventListener('mousedown', function() {
                this.style.transform = 'translate(8px, 8px)';
                this.style.boxShadow = '8px 8px 0 #fff';
            });

            const resetStyle = () => {
                mainWindow.style.transform = '';
                mainWindow.style.boxShadow = originalBoxShadow;
            };

            mainWindow.addEventListener('mouseup', resetStyle);
            mainWindow.addEventListener('mouseleave', resetStyle);
        }

        // Terminal typing effect
        const typedTextSpan = document.getElementById("typed-text");
        const textArray = ["Build a retro arcade game collection.", "Create a cyberpunk portfolio site.", "Design a minimalist blog platform.", "Build a space exploration dashboard.", "Design a brutalist art gallery."];
        const typingDelay = 50;
        const erasingDelay = 5;
        const newTextDelay = 1500; // Delay between current and next text
        let textArrayIndex = 0;
        let charIndex = 0;

        function type() {
            if (charIndex < textArray[textArrayIndex].length) {
                typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
                charIndex++;
                setTimeout(type, typingDelay);
            } else {
                setTimeout(erase, newTextDelay);
            }
        }

        function erase() {
            if (charIndex > 0) {
                typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
                charIndex--;
                setTimeout(erase, erasingDelay);
            } else {
                textArrayIndex++;
                if (textArrayIndex >= textArray.length) textArrayIndex = 0;
                setTimeout(type, typingDelay + 1100);
            }
        }

        setTimeout(type, newTextDelay);
    });
    </script>
</body>
</html>`;

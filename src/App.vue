<template>
  <div class="verify-container">
    <!-- Cloudflare Turnstile Widget -->
    <div class="cf-turnstile-widget">
      <div
        class="cf-turnstile"
        data-sitekey="0x4AAAAAABmNHEm6VBznSVrV"
        data-callback="turnstileCallback"
      ></div>
    </div>
    <!-- 登录按钮/表单等 -->
    <div class="verify-actions">
      <button class="verify-btn" @click="submitVerify" :disabled="!token">
        提交验证
      </button>
      <p
        v-if="verifyMsg"
        class="verify-msg"
        :style="colorFlag ? greenStyle : redStyle"
      >
        {{ verifyMsg }}
      </p>
    </div>
    <div v-if="token" class="token-block">
      <span class="token-label">Token:</span>
      <span class="token-value">{{ token }}</span>
    </div>
  </div>
</template>

<script>
// 交互说明
// 用户在 Vue 页面完成 Turnstile 验证，生成 token。
// 点击“提交验证”按钮时，token 被 POST 到 /api/verify-turnstile。
// Node.js 后端调用 Cloudflare siteverify API 验证 token，并返回结果给前端

export default {
  data() {
    return {
      token: "",
      verifyMsg: "",
      colorFlag: true,
      greenStyle: {
        color: "#26b143",
        background: "#e8fbe5",
        padding: "10px 16px",
        borderRadius: "8px",
        fontWeight: "500",
        borderLeft: "4px solid #26b143",
      },
      redStyle: {
        color: "#c62828",
        background: "#ffeaea",
        padding: "10px 16px",
        borderRadius: "8px",
        fontWeight: "500",
        borderLeft: "4px solid #c62828",
      },
    };
  },
  methods: {
    async submitVerify() {
      if (!this.token) return;
      const url =
        "https://turnstile-backend.gloria-enterprise-account.workers.dev/api/verify-turnstile";
      const body = JSON.stringify({ token: this.token });
      console.log("fetch url:", url);
      console.log("fetch body:", body);
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });
        const data = await res.json();
        if (data.success) {
          this.verifyMsg = "Turnstile 验证通过！";
        } else {
          // this.verifyMsg = "验证失败：" + (data.errors || "未知错误");
          this.verifyMsg =
            "Turnstile 验证失败：" +
            "状态码：" +
            res.status +
            " " +
            "失败原因：" +
            (data.errors || "未知错误");
          this.colorFlag = false;
        }
      } catch (err) {
        console.dir(err);

        this.verifyMsg = "请求错误：" + err.message;
        this.colorFlag = false;
      }
    },
  },
  mounted() {
    // 全局回调，Turnstile会自动调用
    window.turnstileCallback = (token) => {
      this.token = token;
    };
    // 动态加载 Turnstile 脚本
    if (!window.turnstile) {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      document.body.appendChild(script);
    }
  },
};
</script>

<style scoped>
.verify-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 28px 32px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  font-family: "Segoe UI", "Arial", sans-serif;
}

.cf-turnstile-widget {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
}

.verify-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 18px;
}

.verify-btn {
  padding: 9px 28px;
  border-radius: 6px;
  border: none;
  background: #26b143;
  color: #fff;
  font-size: 1.07rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 12px;
  box-shadow: 0 1px 6px rgba(38, 177, 67, 0.06);
}
.verify-btn:disabled {
  background: #dbeedb;
  color: #999;
  cursor: not-allowed;
}

.verify-msg {
  font-size: 1.08rem;
  color: #3c7a1c;
  margin-bottom: 3px;
  font-weight: 500;
}

.token-block {
  background: #f6f6f6;
  padding: 16px;
  border-radius: 10px;
  word-break: break-all;
  font-size: 0.98rem;
  margin-top: 10px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.03);
}
.token-label {
  font-weight: bold;
  color: #444;
  margin-right: 6px;
}
.token-value {
  color: #666;
  font-family: "Consolas", "Menlo", "monospace";
  font-size: 0.93rem;
}
</style>

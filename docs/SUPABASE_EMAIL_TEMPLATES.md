# Supabase Email Templates — CEE Studio Brand

> Παίρνεις τα templates από κάτω, τα κάνεις paste στο Supabase Dashboard:
> https://supabase.com/dashboard/project/vhsfdfaziafkibzpevsq/auth/templates
>
> Βρες κάθε template (Magic Link / Confirm signup / Reset password) → paste το αντίστοιχο HTML → Save.

---

## ✉️ Magic Link

### Subject
```
Sign in to CEE Studio
```

### HTML body — paste ολόκληρο:

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sign in to CEE Studio</title>
</head>
<body style="margin:0;padding:0;background-color:#FDFAF4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#2A1A1A;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FDFAF4;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- Brand header -->
          <tr>
            <td align="center" style="background-color:#661414;padding:40px 40px 32px;">
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;color:#FDFAF4;font-size:32px;font-weight:500;letter-spacing:0.02em;">CEE Studio</h1>
              <p style="margin:8px 0 0;color:#FDFAF4;opacity:0.85;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;">Glattpark · Zürich</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#FFFFFF;padding:48px 40px 40px;border-left:1px solid #E6CDA3;border-right:1px solid #E6CDA3;">
              <h2 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;color:#661414;font-size:24px;font-weight:500;line-height:1.3;">Sign in</h2>
              <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#2A1A1A;">Click the button below to securely sign in to your CEE Studio account. The link is valid for one hour.</p>

              <!-- CTA button -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0;">
                <tr>
                  <td>
                    <a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}"
                       style="display:inline-block;background-color:#661414;color:#FDFAF4;padding:14px 32px;font-size:12px;text-decoration:none;text-transform:uppercase;letter-spacing:0.25em;font-weight:600;border:1px solid #661414;">
                      Sign in &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback URL -->
              <p style="margin:24px 0 8px;font-size:12px;color:#7A6A6A;">Button not working? Copy and paste this URL:</p>
              <p style="margin:0;font-size:11px;color:#661414;word-break:break-all;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">
                {{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}
              </p>

              <hr style="border:none;border-top:1px solid #E6CDA3;margin:32px 0;" />

              <p style="margin:0 0 8px;font-size:13px;color:#7A6A6A;line-height:1.6;">If you didn't request this, you can safely ignore this email.</p>
              <p style="margin:0;font-size:13px;color:#7A6A6A;line-height:1.6;">Questions? Just reply — we read every email.</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#FFFFFF;padding:24px 40px 40px;border-left:1px solid #E6CDA3;border-right:1px solid #E6CDA3;border-bottom:1px solid #E6CDA3;">
              <p style="margin:0;font-size:11px;color:#7A6A6A;text-align:center;line-height:1.6;">
                CEE Studio &middot; Thurgauerstrasse 117, 8152 Glattpark (Opfikon)
              </p>
              <p style="margin:4px 0 0;font-size:11px;color:#7A6A6A;text-align:center;">
                <a href="{{ .SiteURL }}" style="color:#661414;text-decoration:none;">ceestudio.ch</a>
                &nbsp;·&nbsp;
                <a href="https://www.instagram.com/ceestudio.ch/" style="color:#661414;text-decoration:none;">@ceestudio.ch</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

### Πώς να κάνεις paste

1. Άνοιξε https://supabase.com/dashboard/project/vhsfdfaziafkibzpevsq/auth/templates
2. Click **"Magic Link"** template στο sidebar
3. Subject field: `Sign in to CEE Studio`
4. Body field: select-all (Cmd+A) → delete → paste το HTML πάνω
5. Click **Save changes** στο κάτω μέρος

⚠️ **ΣΗΜΑΝΤΙΚΟ**: Αυτό το template χρησιμοποιεί `{{ .TokenHash }}` αντί για `{{ .ConfirmationURL }}` — κάνει το magic link να δουλεύει σε ΟΠΟΙΟΔΗΠΟΤΕ browser/device, όχι μόνο σε αυτόν που ξεκίνησε το flow. Λύνει το PKCE error.

---

## 📧 Confirm Signup (αν χρειαστείς αργότερα — Phase 2 memberships)

### Subject
```
Welcome to CEE Studio
```

### HTML
Παρόμοιο template — αλλάζει μόνο το H2 και το body text. Αν τους χρειαστείς, στείλε μου σήμα.

---

## 🔐 Reset Password
Δεν χρησιμοποιούμε passwords (passwordless auth μόνο), οπότε αυτό το template μένει default.

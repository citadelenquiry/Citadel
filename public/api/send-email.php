<?php
/**
 * Citadel Group - Production Resilient Email Dispatcher
 * Dispatches website inquiries to dual inboxes: citadelgroupenquiry@gmail.com, enquiry@thecitadelgroup.co
 * Supports both Hostinger Native PHP mail() and Custom SMTP (Hostinger Mail, Titan, Gmail).
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

$rawBody = file_get_contents('php://input');
$data = json_decode($rawBody, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON payload']);
    exit;
}

// 1. Extract Lead Data
$name = htmlspecialchars(trim($data['name'] ?? 'Website Visitor'));
$phone = htmlspecialchars(trim($data['phone'] ?? 'Not provided'));
$email = htmlspecialchars(trim($data['email'] ?? 'Not provided'));
$project = htmlspecialchars(trim($data['projectOrRole'] ?? 'General Inquiry'));
$formType = htmlspecialchars(trim($data['formType'] ?? 'Website Contact Form'));
$details = htmlspecialchars(trim($data['details'] ?? ''));
$message = htmlspecialchars(trim($data['message'] ?? ''));
$timestamp = date('d M Y, h:i A') . ' IST';

// Extract Recipients (Supports comma-separated list of emails)
$recipientInput = trim($data['notificationEmail'] ?? '');
$recipientsList = [];
if ($recipientInput) {
    foreach (explode(',', $recipientInput) as $r) {
        $clean = filter_var(trim($r), FILTER_VALIDATE_EMAIL);
        if ($clean && !in_array($clean, $recipientsList)) {
            $recipientsList[] = $clean;
        }
    }
}
if (empty($recipientsList)) {
    $recipientsList = ['citadelgroupenquiry@gmail.com', 'enquiry@thecitadelgroup.co'];
}
$recipientString = implode(', ', $recipientsList);

$subject = "New Citadel Lead: {$name} [{$project}]";

// 2. Format Clean Email Bodies
$plainBody = "========================================\n" .
             "CITADEL GROUP - NEW WEBSITE LEAD INQUIRY\n" .
             "========================================\n\n" .
             "• Full Name: {$name}\n" .
             "• Phone: {$phone}\n" .
             "• Email: {$email}\n" .
             "• Project / Interest: {$project}\n" .
             "• Specific Requirements: " . ($details ?: 'None specified') . "\n" .
             "• Message / Notes: " . ($message ?: 'No message') . "\n" .
             "• Source / Form: {$formType}\n" .
             "• Received At: {$timestamp}\n\n" .
             "Primary Sales Desk: +91 87799 75270\n" .
             "Corporate Office: Prabhat Road, Lane 8, Erandwane, Pune 411004\n";

$htmlBody = '
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1E1D1B; background-color: #FAF8F5; margin: 0; padding: 24px; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #E6E1DC; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
    .header { background: #1E1D1B; color: #ffffff; padding: 24px 32px; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 0.05em; color: #FAF8F5; }
    .header p { margin: 6px 0 0; font-size: 13px; color: #D4CFC9; }
    .tag { display: inline-block; background: #8A563D; color: #ffffff; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 600; text-transform: uppercase; margin-top: 12px; }
    .content { padding: 32px; }
    .row { display: flex; padding: 12px 0; border-bottom: 1px solid #F0ECE8; font-size: 14px; }
    .row:last-child { border-bottom: none; }
    .label { width: 140px; font-weight: 600; color: #6E6862; flex-shrink: 0; }
    .value { color: #1E1D1B; font-weight: 500; word-break: break-word; }
    .value a { color: #8A563D; text-decoration: none; }
    .footer { background: #FAF8F5; padding: 20px 32px; font-size: 12px; color: #8A847E; text-align: center; border-top: 1px solid #E6E1DC; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>CITADEL GROUP</h1>
      <p>Luxury Real Estate & Redevelopment</p>
      <div class="tag">' . htmlspecialchars($formType) . '</div>
    </div>
    <div class="content">
      <div class="row"><div class="label">Client Name:</div><div class="value"><strong>' . $name . '</strong></div></div>
      <div class="row"><div class="label">Phone Number:</div><div class="value"><a href="tel:' . $phone . '">' . $phone . '</a> &nbsp;•&nbsp; <a href="https://wa.me/' . preg_replace('/[^0-9]/', '', $phone) . '" target="_blank">Chat on WhatsApp</a></div></div>
      <div class="row"><div class="label">Email Address:</div><div class="value"><a href="mailto:' . $email . '">' . $email . '</a></div></div>
      <div class="row"><div class="label">Project Interest:</div><div class="value"><strong>' . $project . '</strong></div></div>
      ' . ($details ? '<div class="row"><div class="label">Details:</div><div class="value">' . $details . '</div></div>' : '') . '
      ' . ($message ? '<div class="row"><div class="label">Message:</div><div class="value">' . nl2br($message) . '</div></div>' : '') . '
      <div class="row"><div class="label">Submitted:</div><div class="value">' . $timestamp . '</div></div>
    </div>
    <div class="footer">
      This inquiry was captured live on <strong>thecitadelgroup.in</strong>. Direct lead notification engine.
    </div>
  </div>
</body>
</html>';

// 3. Check for Custom SMTP Configuration
$smtpConfig = $data['smtp'] ?? null;
if (!empty($smtpConfig['host']) && !empty($smtpConfig['user']) && !empty($smtpConfig['pass'])) {
    $smtpResult = sendViaSmtp($smtpConfig, $recipientsList, $subject, $plainBody, $htmlBody, $name, $email);
    if ($smtpResult['success']) {
        echo json_encode([
            'success' => true,
            'mode' => 'smtp',
            'message' => 'Dispatched via custom SMTP successfully to ' . $recipientString,
        ]);
        exit;
    }
    // If SMTP failed, log and attempt PHP mail fallback
    $smtpError = $smtpResult['error'];
}

// 4. Default Fallback: Hostinger Native PHP mail()
$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'From: Citadel Web Desk <noreply@thecitadelgroup.in>',
    'Reply-To: ' . ($email !== 'Not provided' ? $email : 'enquiry@thecitadelgroup.co'),
    'X-Mailer: Citadel-Resilient-PHP/' . phpversion()
];

$mailSent = @mail($recipientString, $subject, $htmlBody, implode("\r\n", $headers));

if ($mailSent) {
    echo json_encode([
        'success' => true,
        'mode' => 'php_mail',
        'message' => 'Dispatched via server mail engine successfully to ' . $recipientString,
    ]);
} else {
    // If both failed or mail disabled
    echo json_encode([
        'success' => false,
        'mode' => 'failed',
        'error' => isset($smtpError) ? "SMTP failed: {$smtpError}. PHP mail fallback returned false." : 'Server mail() returned false. Please verify server sendmail / Hostinger mail configuration.',
    ]);
}

/**
 * Socket-based SMTP Dispatcher (Clean, Zero dependencies)
 */
function sendViaSmtp($smtp, $recipientsList, $subject, $plainText, $htmlText, $senderName, $replyToEmail) {
    $host = trim($smtp['host']);
    $port = intval($smtp['port'] ?? 465);
    $user = trim($smtp['user']);
    $pass = $smtp['pass'];
    $secure = strtolower($smtp['secure'] ?? ($port === 465 ? 'ssl' : 'tls'));

    $timeout = 15;
    $socketHost = ($secure === 'ssl' ? 'ssl://' : '') . $host;

    $socket = @fsockopen($socketHost, $port, $errno, $errstr, $timeout);
    if (!$socket) {
        return ['success' => false, 'error' => "Could not connect to {$host}:{$port} ({$errstr})"];
    }

    $read = function($expectedCode = null) use ($socket) {
        $response = '';
        while ($line = fgets($socket, 515)) {
            $response .= $line;
            if (substr($line, 3, 1) === ' ') break;
        }
        if ($expectedCode && substr($response, 0, 3) !== (string)$expectedCode) {
            throw new Exception("SMTP Error: Expected {$expectedCode}, got: {$response}");
        }
        return $response;
    };

    $send = function($cmd) use ($socket) {
        fputs($socket, $cmd . "\r\n");
    };

    try {
        $read('220');
        $send('EHLO ' . gethostname());
        $read('250');

        if ($secure === 'tls') {
            $send('STARTTLS');
            $read('220');
            stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
            $send('EHLO ' . gethostname());
            $read('250');
        }

        $send('AUTH LOGIN');
        $read('334');
        $send(base64_encode($user));
        $read('334');
        $send(base64_encode($pass));
        $read('235');

        $send("MAIL FROM: <{$user}>");
        $read('250');

        foreach ($recipientsList as $rcpt) {
            $send("RCPT TO: <{$rcpt}>");
            $read('250');
        }

        $send('DATA');
        $read('354');

        $boundary = '=_citadel_' . md5(uniqid(time()));
        $recipientsHeader = implode(', ', $recipientsList);
        $message = "From: Citadel Group Inquiry <{$user}>\r\n" .
                   "To: {$recipientsHeader}\r\n" .
                   "Reply-To: " . ($replyToEmail !== 'Not provided' ? "<{$replyToEmail}>" : "<{$user}>") . "\r\n" .
                   "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n" .
                   "Date: " . date('r') . "\r\n" .
                   "MIME-Version: 1.0\r\n" .
                   "Content-Type: multipart/alternative; boundary=\"{$boundary}\"\r\n\r\n" .
                   "--{$boundary}\r\n" .
                   "Content-Type: text/plain; charset=UTF-8\r\n" .
                   "Content-Transfer-Encoding: 8bit\r\n\r\n" .
                   "{$plainText}\r\n\r\n" .
                   "--{$boundary}\r\n" .
                   "Content-Type: text/html; charset=UTF-8\r\n" .
                   "Content-Transfer-Encoding: 8bit\r\n\r\n" .
                   "{$htmlText}\r\n\r\n" .
                   "--{$boundary}--\r\n" .
                   ".";

        $send($message);
        $read('250');

        $send('QUIT');
        fclose($socket);

        return ['success' => true];
    } catch (Exception $e) {
        if (is_resource($socket)) fclose($socket);
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

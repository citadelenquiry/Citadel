<?php
/**
 * Citadel Group - Production Entry Point for Hostinger LiteSpeed
 * Automatically serves the compiled React application (index.html) with strict no-cache headers.
 */

// Tell Browsers, LiteSpeed, and Hostinger CDN (hcdn) to never cache the HTML entry point
header('Cache-Control: no-cache, no-store, must-revalidate, max-age=0, proxy-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
header('X-LiteSpeed-Cache-Control: no-cache');
header('X-Accel-Expires: 0');
header('Content-Type: text/html; charset=utf-8');

$htmlPath = __DIR__ . '/index.html';
if (file_exists($htmlPath)) {
    readfile($htmlPath);
    exit;
} else {
    echo '<!DOCTYPE html><html><head><title>Citadel Group</title></head><body><h1>Citadel Group</h1><p>Website is initializing...</p></body></html>';
}
?>

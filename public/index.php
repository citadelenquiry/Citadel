<?php
/**
 * Citadel Group - Production Entry Point for Hostinger LiteSpeed
 * Automatically serves the compiled React application (index.html).
 */
$htmlPath = __DIR__ . '/index.html';
if (file_exists($htmlPath)) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($htmlPath);
    exit;
} else {
    echo '<!DOCTYPE html><html><head><title>Citadel Group</title></head><body><h1>Citadel Group</h1><p>Website is initializing...</p></body></html>';
}
?>

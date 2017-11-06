package com.example.velioo.compmax;

import android.app.Activity;
import android.net.http.SslError;
import android.os.Bundle;
import android.webkit.SslErrorHandler;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        WebView myWebView = (WebView) findViewById(R.id.webview);
        myWebView.setWebViewClient(new WebViewClient() {
            public void onReceivedSslError (WebView view, SslErrorHandler handler, SslError error) {
                handler.proceed();
            }
        });
        WebSettings webSettings = myWebView.getSettings();
        webSettings.setBuiltInZoomControls(true);
        webSettings.setDisplayZoomControls(false);
        webSettings.setJavaScriptEnabled(true);
        myWebView.loadUrl("https:/10.20.1.104/online_store");
    }

 /*   private class MyWebViewClient extends WebViewClient {

        @Override

        public boolean shouldOverrideUrlLoading(WebView view, String url) {

            if (Uri.parse(url).getHost().equals("10.20.1.104")) {

                return false;

            }


            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));

            startActivity(intent);

            return true;
        }
    }*/
}
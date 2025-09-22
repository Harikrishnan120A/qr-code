import base64
import io
from datetime import date
import qrcode
from django.shortcuts import render
from django.http import HttpResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def qr_card(request):
    """Render a simple QR card without database dependencies"""
    ctx = {
        "name": "M.Abinaya",
        "department": "Bsc.CS",
        "year": "3rd year",
        "date": "",
        "qr_b64": None,
        "in_time": "Not marked",
        "out_time": "Not marked",
    }

    if request.method == "POST":
        today = date.today().isoformat()
        
        # Create QR content with all student information and date
        qr_content = f"""Name: M.Abinaya
Department: Bsc.CS
Year: 3rd year
Date: {today}"""
        
        # Generate QR code with all information
        img = qrcode.make(qr_content)

        buf = io.BytesIO()
        img.save(buf, format="PNG")
        ctx["qr_b64"] = base64.b64encode(buf.getvalue()).decode("utf-8")
        ctx["date"] = today

    # Return a simple HTML response for now
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>QR Code Generator</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body {{ 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                max-width: 800px; 
                margin: 0 auto; 
                padding: 20px; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                color: #333;
            }}
            .container {{
                background: white;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                overflow: hidden;
            }}
            .header {{
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }}
            .header h1 {{
                margin: 0;
                font-size: 2.5em;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }}
            .card {{ 
                padding: 40px; 
                text-align: center; 
            }}
            .student-info {{
                background: #f8f9fa;
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
                border-left: 5px solid #4facfe;
            }}
            .info-row {{
                display: flex;
                justify-content: space-between;
                margin: 10px 0;
                padding: 5px 0;
            }}
            .info-label {{
                font-weight: bold;
                color: #555;
            }}
            .info-value {{
                color: #333;
            }}
            .qr-code {{ 
                margin: 30px 0; 
                padding: 20px;
                background: white;
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }}
            .qr-code img {{
                max-width: 300px;
                border-radius: 10px;
            }}
            button {{ 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; 
                padding: 15px 30px; 
                border: none; 
                border-radius: 25px; 
                cursor: pointer; 
                font-size: 1.1em;
                font-weight: bold;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            }}
            button:hover {{ 
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
            }}
            .footer {{
                background: #f8f9fa;
                padding: 20px;
                text-align: center;
                color: #666;
                border-top: 1px solid #eee;
            }}
            .status {{
                margin: 20px 0;
                padding: 15px;
                background: #e3f2fd;
                border-radius: 8px;
                border-left: 4px solid #2196f3;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎓 Student QR Code Generator</h1>
                <p>Generate attendance QR codes instantly</p>
            </div>
            
            <div class="card">
                <div class="student-info">
                    <h2>Student Information</h2>
                    <div class="info-row">
                        <span class="info-label">👤 Name:</span>
                        <span class="info-value">{ctx['name']}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">🎓 Department:</span>
                        <span class="info-value">{ctx['department']}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">📅 Year:</span>
                        <span class="info-value">{ctx['year']}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">📆 Date:</span>
                        <span class="info-value">{ctx['date'] or 'Not generated yet'}</span>
                    </div>
                </div>

                <div class="status">
                    <div class="info-row">
                        <span class="info-label">⏰ In Time:</span>
                        <span class="info-value">{ctx['in_time']}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">⏰ Out Time:</span>
                        <span class="info-value">{ctx['out_time']}</span>
                    </div>
                </div>
                
                <form method="post">
                    <button type="submit">🎯 Generate QR Code</button>
                </form>
                
                {f'<div class="qr-code"><h3>✅ QR Code Generated Successfully!</h3><img src="data:image/png;base64,{ctx["qr_b64"]}" alt="QR Code"><p><strong>Scan this code to record attendance</strong></p></div>' if ctx["qr_b64"] else ''}
            </div>
            
            <div class="footer">
                <p>📱 <strong>How to use:</strong> Click "Generate QR Code" then scan with any QR code reader</p>
                <p>💡 <em>Advanced scanning features available with full setup</em></p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return HttpResponse(html_content)

def simple_message(request):
    """Simple message view"""
    return HttpResponse("<h1>QR Code System</h1><p>Basic QR generation is working!</p><p><a href='/'>Go to QR Generator</a></p>")
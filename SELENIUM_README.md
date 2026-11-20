# CafeBook Selenium Automation Test

This folder contains a simple, beginner-friendly Selenium WebDriver automation script for testing the complete customer booking journey on the deployed CafeBook application.

---

## Prerequisites

1. **Python 3.8+** installed.
2. **Google Chrome** browser installed.
3. Install required Python packages:

```bash
pip install -r requirements.txt
```

---

## Configuration (Environment Variables)

The script uses sensible defaults pointing to the live deployed application and an existing customer account. You can optionally override them:

| Environment Variable | Description | Default Value |
|---|---|---|
| `CAFEBOOK_URL` | Base URL of deployed website | `https://cafebook-two.vercel.app` |
| `CAFEBOOK_CUSTOMER_EMAIL` | Normal customer account email | `test1@gmail.com` |
| `CAFEBOOK_CUSTOMER_PASSWORD` | Customer account password | `9916925969` |
| `CAFEBOOK_WAIT_TIMEOUT` | Explicit wait timeout in seconds | `15` |

### Setting Environment Variables in Windows PowerShell (Optional):

```powershell
$env:CAFEBOOK_CUSTOMER_EMAIL="test1@gmail.com"
$env:CAFEBOOK_CUSTOMER_PASSWORD="your_password"
```

---

## Running the Test

Run the script from the project root directory:

```bash
python cafe_booking_test.py
```

---

## Expected Output

On success:
```text
Customer login successful.
Booking page opened.
Tomorrow's date selected.
Available table selected.
Booking confirmed successfully.
My Bookings page opened.
Booking verified successfully.

--- Booking Details ---
Booking Reference : CB-XXXXXXX
Customer Email    : test1@gmail.com
Date              : YYYY-MM-DD
Time Slot         : 11:30 AM
Guests            : 2
-----------------------

FINAL RESULT: PASS
```

If any step fails, the script captures a screenshot (`booking_failure.png`), prints the error cause, and outputs:
```text
FINAL RESULT: FAIL
```

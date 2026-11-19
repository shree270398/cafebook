# CafeBook Deployed-Website Selenium Workflow

Run this script against the deployed CafeBook website:

```bash
cd tests/selenium
python -m pip install -r requirements.txt
python test_cafebook.py
```

Optional environment variables:

- `CAFEBOOK_WAIT_SECONDS`: Selenium explicit wait timeout
- `CAFEBOOK_HEADLESS=true`: Run Chrome without a visible window
- `CAFEBOOK_ADMIN_EMAIL`: Administrator email
- `CAFEBOOK_ADMIN_PASSWORD`: Administrator password
- `CAFEBOOK_SCREENSHOT`: Failure screenshot path

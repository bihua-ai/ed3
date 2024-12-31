import asyncio
import re
from playwright.async_api import Playwright, async_playwright, expect
from datetime import datetime

async def run(playwright: Playwright, platform_name: str, platform_url: str, username: str, password: str, course_name: str, headless: bool) -> None:
    # Launch browser with default settings
    browser = await playwright.chromium.launch(headless=headless)
    context = await browser.new_context(locale="zh-CN")

    # Block external requests that might trigger xdg-open pop-ups
    # context.on("route", lambda route, request: route.continue_() if "http" in request.url else route.abort())

    page = await context.new_page()

    # Use platform_name to select the URL or perform platform-specific logic (optional)
    if platform_name.lower() == "chaoxing":
        # For Chaoxing platform, use the provided URL (can be customized based on platform)
        await page.goto(platform_url)
    else:
        print(f"Unsupported platform: {platform_name}")
        return
    
    await asyncio.sleep(3)

    # Login process
    await page.get_by_placeholder("手机号/超星号").click()
    await page.get_by_placeholder("手机号/超星号").fill(username)
    await page.get_by_placeholder("学习通密码").click()
    await page.get_by_placeholder("学习通密码").fill(password)
    await page.get_by_role("button", name="登录").click()
    await asyncio.sleep(3)
    
    # Navigate to the course section
    await page.get_by_role("heading", name="课程", exact=True).click()
    await asyncio.sleep(3)
    
    # Click on the course link, matching by course name
    async with page.expect_popup() as page1_info:
        await page.locator("iframe[name=\"frame_content\"]").content_frame.get_by_role("link", name=re.compile(f"^{course_name}")).click()
    page1 = await page1_info.value
    await asyncio.sleep(3)
    
    # Navigate to statistics
    await page1.get_by_role("link", name="统计").click()
    await asyncio.sleep(3)
    
    # Perform actions related to exporting data
    await page1.locator("iframe[name=\"frame_content-tj\"]").content_frame.locator("iframe[name=\"tj-head\"]").content_frame.get_by_text("学生成绩").click()
    await asyncio.sleep(3)
    
    await page1.locator("iframe[name=\"frame_content-tj\"]").content_frame.locator("iframe[name=\"tj-head\"]").content_frame.locator("#needStudent").get_by_text("一键导出").click()
    await asyncio.sleep(3)
    
    await page1.locator("iframe[name=\"frame_content-tj\"]").content_frame.locator("iframe[name=\"tj-head\"]").content_frame.locator("#popExport_scroll ul").filter(has_text="全选 已选中 0 个").get_by_role("listitem").first.click()
    await asyncio.sleep(3)
    
    await page1.locator("iframe[name=\"frame_content-tj\"]").content_frame.locator("iframe[name=\"tj-head\"]").content_frame.get_by_role("link", name="导出").click()
    await asyncio.sleep(3)
    
    async with page1.expect_download() as download_info:
        async with page1.expect_popup() as page2_info:
            await page1.locator("li.handles a.download_ic").click()
        page2 = await page2_info.value
    download = await download_info.value
    
    # Generate the timestamp and use it to save the file with course_name
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    download_path = f"{course_name}_{timestamp}.xlsx"
    await download.save_as(download_path)
    await asyncio.sleep(3)
    
    await page2.close()
    await asyncio.sleep(3)
    
    await page1.locator("li.handles a.deleteOrCancel").click()
    await asyncio.sleep(3)

    # Save the context and close the browser
    await context.storage_state(path="auth.json")
    await context.close()
    await browser.close()


async def main() -> None:
    # Example usage of the run function with user-defined inputs
    platform_name = "chaoxing"  # Platform name input
    platform_url = "https://passport2.chaoxing.com/login?fid=&newversion=true&refer=https%3A%2F%2Fi.chaoxing.com"
    username = "15660427735"
    password = "Dec291990!"
    course_name = "机械设计学"
    headless = False  # Set to False for headful mode
    
    async with async_playwright() as playwright:
        await run(playwright, platform_name, platform_url, username, password, course_name, headless)


asyncio.run(main())

"""
리로스쿨 Playwright 자동화 모듈

TODO: 리로스쿨 분석 후 실제 코드 작성
"""
from playwright.async_api import async_playwright
import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

# 환경변수에서 로그인 정보 가져오기
LIRO_USERNAME = os.getenv("LIRO_USERNAME")
LIRO_PASSWORD = os.getenv("LIRO_PASSWORD")


async def send_absence_sms(date: str, students: List[dict]) -> dict:
    """
    리로스쿨에서 결석 문자 발송

    Args:
        date: 날짜 (YYYY-MM-DD)
        students: 결석 학생 목록 [{"seatId": "4A101", "name": "홍길동", "grade": 1, "note": ""}]

    Returns:
        {"success": bool, "message": str, "sent_count": int, "failed_count": int}
    """
    sent_count = 0
    failed_count = 0

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        try:
            # ========================================
            # TODO: 리로스쿨 분석 후 아래 코드 작성
            # ========================================

            # 1. 리로스쿨 로그인
            # await page.goto("리로스쿨 URL")
            # await page.fill("#username", LIRO_USERNAME)
            # await page.fill("#password", LIRO_PASSWORD)
            # await page.click("로그인 버튼 selector")
            # await page.wait_for_load_state("networkidle")

            # 2. 문자 발송 페이지로 이동
            # await page.goto("문자 발송 페이지 URL")

            # 3. 각 학생에게 문자 발송
            for student in students:
                try:
                    # TODO: 문자 발송 로직
                    # - 수신자 선택 (학생 이름으로 검색?)
                    # - 문자 내용 입력
                    # - 발송 버튼 클릭

                    print(f"[테스트] {student['name']} ({student['seatId']}) 문자 발송")
                    sent_count += 1

                except Exception as e:
                    print(f"Failed to send SMS to {student['name']}: {e}")
                    failed_count += 1

        except Exception as e:
            print(f"리로스쿨 자동화 오류: {e}")
            raise e

        finally:
            await browser.close()

    return {
        "success": failed_count == 0,
        "message": f"발송 완료: {sent_count}명 성공, {failed_count}명 실패",
        "sent_count": sent_count,
        "failed_count": failed_count
    }

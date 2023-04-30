import asyncio
from crawler import Crawler
from quart import Quart
import hypercorn.asyncio

app = Quart(__name__)

playwright_instance = None

async def init_crawler():
    global playwright_instance
    playwright_instance = await Crawler.create()

@app.before_serving
async def startup():
    await init_crawler()

@app.after_serving
async def shutdown():
    if playwright_instance:
        await playwright_instance.close()

@app.route('/status')
async def status():
    global playwright_instance
    if playwright_instance:
        return 'PlayWright instance is running'
    else:
        return 'PlayWright instance is not running'
    
@app.route('/search/<query>')
async def search(query):
    global playwright_instance
    if playwright_instance:
        print('Searching for ' + query)
        return await playwright_instance.search_google(query)
    else:
        print('PlayWright instance is not running')
        return 'PlayWright instance is not running'

@app.route('/crawl')
async def crawl():
    global playwright_instance
    if playwright_instance:
        print('Crawling')
        return await playwright_instance.crawl()
    else:
        print('PlayWright instance is not running')
        return 'PlayWright instance is not running'

@app.route('/page/<url>')
async def page(url):
    global playwright_instance
    if playwright_instance:
        print('Going to page ' + url)
        return await playwright_instance.go_to_page(url)
    else:
        print('PlayWright instance is not running')
        return 'PlayWright instance is not running'

@app.route('/scroll/<direction>')
async def scroll(direction):
    global playwright_instance
    if playwright_instance:
        print('Scrolling ' + direction)
        return await playwright_instance.scroll(direction)
    else:
        print('PlayWright instance is not running')
        return 'PlayWright instance is not running'

@app.route('/click/<selector>')
async def click(selector):
    global playwright_instance
    if playwright_instance:
        print('Clicking ' + selector)
        return await playwright_instance.click(selector)
    else:
        print('PlayWright instance is not running')
        return 'PlayWright instance is not running'

@app.route('/type/<selector>/<text>')
async def type(selector, text):
    global playwright_instance
    if playwright_instance:
        print('Typing ' + text + ' in ' + selector)
        return await playwright_instance.type(selector, text)
    else:
        print('PlayWright instance is not running')
        return 'PlayWright instance is not running'
    
@app.route('/enter')
async def enter():
    global playwright_instance
    if playwright_instance:
        print('Pressing enter')
        return await playwright_instance.enter()
    else:
        return 'PlayWright instance is not running'


if __name__ == '__main__':
    asyncio.run(hypercorn.asyncio.serve(app, hypercorn.Config()))


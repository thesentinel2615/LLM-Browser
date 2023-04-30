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
        await playwright_instance.search_google(query)
        return ('Searching for ' + query)
    else:
        print('PlayWright instance is not running')
        return 'PlayWright instance is not running'

@app.route('/crawl')
async def crawl():
    global playwright_instance
    if playwright_instance:
        print('Crawling')
        data = "\n".join(await playwright_instance.crawl())
        return data[:4500]
    else:
        print('PlayWright instance is not running')
        return 'PlayWright instance is not running'

@app.route('/page/<url>')
async def page(url):
    global playwright_instance
    if playwright_instance:
        print('Going to page ' + url)
        await playwright_instance.go_to_page(url)
        return ('Going to page ' + url)
    else:
        print('PlayWright instance is not running')
        return 'PlayWright instance is not running'

@app.route('/scroll/<direction>')
async def scroll(direction):
    global playwright_instance
    if playwright_instance:
        print('Scrolling ' + direction)
        await playwright_instance.scroll(direction)
        return ('Scrolling ' + direction)
    else:
        print('PlayWright instance is not running')
        return 'PlayWright instance is not running'

@app.route('/click/<selector>')
async def click(selector):
    global playwright_instance
    if playwright_instance:
        print('Clicking ' + selector)
        await playwright_instance.click(selector)
        return ('Clicking ' + selector)
    else:
        print('PlayWright instance is not running')
        return 'PlayWright instance is not running'

@app.route('/type/<selector>/<text>')
async def type(selector, text):
    global playwright_instance
    if playwright_instance:
        print('Typing ' + text + ' in ' + selector)
        await playwright_instance.type(selector, text)
        return ('Typing ' + text + ' in ' + selector)
    else:
        print('PlayWright instance is not running')
        return 'PlayWright instance is not running'
    
@app.route('/enter')
async def enter():
    global playwright_instance
    if playwright_instance:
        print('Pressing enter')
        await playwright_instance.enter()
        return ('Pressing enter')
    else:
        return 'PlayWright instance is not running'


if __name__ == '__main__':
    asyncio.run(hypercorn.asyncio.serve(app, hypercorn.Config()))


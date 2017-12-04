from urllib.request import urlopen
from urllib.request import urlretrieve
import re
import validators
import sys
import pymysql.cursors
from random import randint
from html.parser import HTMLParser
from bs4 import BeautifulSoup
import os
import shutil

html_p = HTMLParser()
base_url = sys.argv[1] if (len(sys.argv) > 1 and sys.argv[1]) else False
visited = []
products_inserted = 0

def main():
	if base_url:
		connection = pymysql.connect(host='localhost', user='root', password='12345678', db='online_store', charset='utf8mb4', 
											cursorclass=pymysql.cursors.DictCursor)
		global result
		global base_name
		try:
			with connection.cursor() as cursor:
				sql = "SELECT `id`, `name` FROM `categories`"
				cursor.execute(sql)
				result = cursor.fetchall()
		
			if validators.url(base_url):
				base_name = base_url.split('//')[-1]
				visit_url(base_url, connection)
			else:
				print("URL is not valid")
		except Exception as e:
			print(e)
		finally:
			connection.close()
			
	else:
		print ("No URL specified!")


def visit_url(url, connection):
		global products_inserted
		print("Visiting: " + url)
		visited.append(url)
		response = urlopen(url)
		if(response.headers.get_content_charset() == None):
			return
		lines = response.read().decode(response.headers.get_content_charset())
		soup = BeautifulSoup(lines, "html5lib")
		try:
			for data in soup.findAll('input', {'type':'hidden', 'class':'soaring-cart-data', 'data-url':True, 'data-img_url':True, 'data-name':True, 'data-price':True}):			
				product_title = html_p.unescape(html_p.unescape(data['data-name']))
				product_image_url = base_url + data['data-img_url'] if base_name not in data['data-img_url'] else data['data-img_url']
				product_image_url = product_image_url.replace("96x96", "200x0")				
				product_image = product_image_url.rsplit('/', 1)[-1]
				product_price = data['data-price']
				urlretrieve(product_image_url, '/var/www/html/online_store/assets/imgs/' + product_image)
				product_category = 1
				for word in product_title.split(" "):
					matched_categories = [x for x in result if len(word) >= 3 and re.match(r'' + re.escape(word[:-2]) + '', x['name'], re.IGNORECASE) and (len(word) >= (len(x['name'])/2))]
					if matched_categories: product_category = matched_categories[0]['id']
				with connection.cursor() as cursor:
					sql = "INSERT INTO `products` (`category_id`, `name`, `description`, `price_leva`, `image`, `quantity`) VALUES (%s, %s, %s, %s, %s, %s)"
					cursor.execute(sql, (product_category, product_title, ' ', product_price, product_image, randint(1, 10000)))
				connection.commit()
				products_inserted+=cursor.rowcount
				print("Products inserted: ", products_inserted)
			soup = BeautifulSoup(lines, "html5lib")
			links = []
			for data in soup.findAll('a', {'href':True}):
				link = data['href']
				if base_name in link:
					links.append(link)
				elif link[0] is '/' and len(link) > 1:
					links.append(base_url + link)

			for link in links:
				if link and link not in visited and validators.url(link):
					visit_url(link, connection)
					
		except Exception as e:
			print(e)


if __name__ == "__main__":
	main()

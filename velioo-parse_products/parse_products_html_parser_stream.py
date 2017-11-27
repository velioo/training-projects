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
base_name = base_url.split('//')[-1]
visited = ['/']

def main():
	if base_url:
		connection = pymysql.connect(host='localhost', user='root', password='12345678', db='online_store', charset='utf8mb4', 
											cursorclass=pymysql.cursors.DictCursor)
		global result
		try:
			with connection.cursor() as cursor:
				sql = "SELECT `id`, `name` FROM `categories`"
				cursor.execute(sql)
				result = cursor.fetchall()
		except Exception as e:
			print(e)
		finally:
			connection.close()
			
		visit_url(base_url)
	else:
		print ("No URL specified!")


def visit_url(url):
		connection = pymysql.connect(host='localhost', user='root', password='12345678', db='online_store', charset='utf8mb4', 
											cursorclass=pymysql.cursors.DictCursor)
		print("Visiting: " + url)
		visited.append(url)
		response = urlopen(url)
		lines = response.read().decode('utf-8')
		soup = BeautifulSoup(lines, "html5lib")
		data = soup.find('input', {'type':'hidden', 'class':'soaring-cart-data', 'data-url':True, 'data-img_url':True, 'data-name':True, 'data-price':True})
		
		try:
			if data != None:
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
			
				while data != None:
					data = data.findNext('input', {'type':'hidden', 'class':'soaring-cart-data', 'data-url':True, 'data-img_url':True, 'data-name':True, 'data-price':True})
					if data == None: break
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
						
			data = soup.find('a', {'href':True})			
			links = []
			if data != None:
				link = data['href']
				if base_name in link:
					links.append(link)
				elif link[0] is '/':
					links.append(base_url + link)
				
				while data != None:
					data = data.findNext('a', {'href':True})
					if data == None: break
					link = data['href']
					if base_name in link:
						links.append(link)
					elif link[0] is '/':
						links.append(base_url + link)

				for link in links:
					if link and link not in visited and validators.url(link):
						visit_url(link)
					
		except Exception as e:
			print(e)
		finally:
			connection.close()


if __name__ == "__main__":
	main()

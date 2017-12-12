from urllib.request import urlopen
from urllib.request import urlretrieve
import urllib.error
import re
import validators
import sys
import os
import pymysql
from random import randint
from html.parser import HTMLParser
import os
import shutil
import requests
from socket import timeout

html_p = HTMLParser()
base_url = sys.argv[1] if (len(sys.argv) > 1 and sys.argv[1]) else False
visited = []
to_visit = []
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

		except pymysql.err.OperationalError as oe:
			print(oe)
		except pymysql.err.InternalError as ie:
			print(ie)
		except pymysql.err.DatabaseError as de:
			print(de)
		except pymysql.err.InterfaceError as ie:
			print(ie)
		except pymysql.err.Error as e:
			print(e)	
		except AttributeError as ae:
			print(ae)
		except TypeError as te:
			print(ty)
		except Exception as e:
			print('Unknown error occured',e)
		finally:
			connection.close()	
			
	else:
		print ("No URL specified!")


def visit_url(url, connection):
		global products_inserted
		try:
			print("Visiting: " + url)
			visited.append(url)
			response = urlopen(url, timeout = 10)
			if response.info().get_content_type() != 'text/html':
				print('Url', url , ' is not text/html, returning...')
				return		
			lines = response.read().decode('utf-8')
			matched = re.findall(r'<input\s*type\s*=\s*"\s*hidden\s*"\s*class\s*=\s*"\s*soaring-cart-data\s*"\s*data-url\s*=\s*"\s*(.+)\s*"\s*data-img_url\s*=\s*"(.+)\s*"\s*data-name\s*=\s*"\s*(.+)\s*"\s*data-price\s*=\s*"\s*(\d+)\s*"', lines)	
			for data in matched:
				if len(data) == 4:
					product_title = html_p.unescape(html_p.unescape(data[2]))
					product_image_url = base_url + data[1] if base_name not in data[1] else data[1]
					product_image_url = html_p.unescape(html_p.unescape(product_image_url.replace("96x96", "200x0")))
					product_image = html_p.unescape(html_p.unescape(product_image_url.rsplit('/', 1)[-1]))
					product_price = html_p.unescape(html_p.unescape(data[3]))
					try:
						print("Getting image of product: ", product_image_url)
						urlretrieve(product_image_url, '/var/www/html/online_store/assets/imgs/' + product_image)
					except urllib.error.ContentTooShortError as e:
						print("Image", product_image_url , "wasn't fully downloaded")
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

			matched = re.findall(r'<\s*a \s*href="([^"]*(?<!.jpg|.png|jpeg))"', lines, re.IGNORECASE)
			response.close()
			links = []
			for link in matched:
				if base_name in link:
					links.append(link)
				elif link[0] is '/' and len(link) > 1:
					links.append(base_url + link)
			for link in links:
				if link and link not in visited and validators.url(link):
					#to_visit.append(link)
					visit_url(link, connection)
		except OSError as e:
			if isinstance(e, timeout):
				print("Timeout occured retrying...")
				visit_url(url, connection)
			else:
				print(e)
		except pymysql.err.DataError as de:
			print(de)
		except pymysql.err.IntegrityError as ie:
			print(ie)	
		except pymysql.err.ProgrammingError as pe:
			print(pe)
		except pymysql.err.OperationalError as oe:
			print(oe)
		except pymysql.err.InternalError as ie:
			print(ie)
		except pymysql.err.Error as e:
			print(e)
		except UnicodeDecodeError as e:
			print(e)
		except Exception as e:
			print('Unknown error occured')


if __name__ == "__main__":
	try:
		main()
	except pymysql.err.OperationalError as oe:
		print(oe)
	except pymysql.err.InternalError as ie:
		print(ie)
	except pymysql.err.DatabaseError as de:
		print(de)
	except pymysql.err.InterfaceError as ie:
		print(ie)
	except pymysql.err.NotSupportedError as nse:
		print(nse)
	except pymysql.err.Error as e:
		print(e)
	except AttributeError as ae:
		print(ae)
	except TypeError as te:
		print(ty)
	except NameError as ne:
		print(e)
	except Exception as e:
			print('Unknown error occured',e)

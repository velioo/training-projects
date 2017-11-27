from urllib.request import urlopen
from urllib.request import urlretrieve
import re
import validators
import sys
import pymysql.cursors

base_url = sys.argv[1] if (len(sys.argv) > 1 and sys.argv[1]) else False
visited = []

def main():
	if base_url:
		lines = visit_url(base_url)
	else:
		print ("No URL specified!")

def visit_url(url):
	try:
		print("Visiting: " + url)
		visited.append(url)
		response = urlopen(url)
		lines = response.read().decode('utf-8')
		matched = re.findall(r'<img itemprop="image" alt=".+" title="(.*)" src="([^"]*)"', lines)
		for img in matched:
			if len(img) > 1:
				product_title = img[0]
				product_image_url = base_url + img[1]						
				print (product_title + " ----- " + product_image_url)
				product_image = product_image_url.rsplit('/', 1)[-1]
				urlretrieve(product_image_url, '/var/www/html/online_store/assets/imgs/' + product_image)
				connection = pymysql.connect(host='localhost', user='root', password='12345678', db='online_store', charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor)
				try:
					with connection.cursor() as cursor:
						sql = "INSERT INTO `products` (`category_id`, `name`, `description`, `price_leva`, `image`, `quantity`) VALUES (%s, %s, %s, %s, %s, %s)"
						cursor.execute(sql, ('1', product_title, ' ', '25', product_image, '1'))
					connection.commit()
					#~ with connection.cursor() as cursor:
						#~ sql = "SELECT `id`, `password` FROM `users` WHERE `email`=%s"
						#~ cursor.execute(sql, ('webmaster@python.org',))
						#~ result = cursor.fetchone()
						#~ print(result)
				finally:
					connection.close()
                             
				break
			
		return
		matched = re.findall(r'href="([^"]*)"', lines)
		links = []
		for link in matched:
			if base_url in link:
				links.append(link)
			elif link[0] is '/':
				links.append(base_url + link)
		for link in links:
			if link and link not in visited and validators.url(link):
				visit_url(link)
	except Exception as e:
		print(e)



if __name__ == "__main__":
	main()

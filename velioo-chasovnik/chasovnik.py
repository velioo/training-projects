#~ import math

#~ h_hand = 0
#~ m_hand = 0

#~ h_time = 0
#~ m_time = 0
#~ s_time = 0
#~ ms_time = 0

#~ while(1):
	
	#~ if (h_hand == m_hand and h_time != 0) or (h_time > 0 and m_hand > h_hand):
		#~ break
	
	#~ s_time += 1
	#~ ms_time += 1000
	
	#~ m_hand += 60
	#~ h_hand += 5
	
	#~ print (h_hand, ' - ' , m_hand)
	
	#~ if m_time == 59 and s_time == 60:
		#~ h_time += 1
		#~ m_time = 0
		#~ s_time = 0
		#~ m_hand = 0
		#~ s_hand = 0
		#~ print ('H_hand - ' + str(h_hand), ' ', str(m_hand))
	#~ elif s_time == 60:
		#~ m_time += 1
		#~ s_time = 0
		#~ s_hand = 0
				
	#~ #print (h_hand, ' ', m_hand)
	

#~ print (str(h_time) + ':' + str(m_time) + ':' + str(s_time) + '.' + str(ms_time/100000))

import math

h_hand = 0
m_hand = 0

h_time = 0
m_time = 0
s_time = 0
ms_time = 0

prev_h_hand = 0
prev_m_hand = 0

flag = False

while(1):
	
	if (h_hand == m_hand or m_hand > h_hand) and h_time != 0:
		break
		
	ms_time += 1000
	s_time += 1
	
	prev_h_hand = h_hand
	prev_m_hand = m_hand
	
	m_hand += 60
	h_hand += 5
	
	#print (h_hand, ' - ' , m_hand)
	
	if m_time == 59 and s_time == 60:
		h_time += 1
		m_time = 0
		s_time = 0
		m_hand = 0
		s_hand = 0
		#print (h_hand, ' ', m_hand)
	elif s_time == 60:
		m_time += 1
		s_time = 0
		s_hand = 0
				
	#print (h_hand, ' ', m_hand)


if m_hand > h_hand:
	diff = prev_h_hand - prev_m_hand
	temp = (diff/60.0) * 100.0
	temp = temp/100
	s_time = int(s_time - (temp/100)*s_time)
	
print (str(h_time) + ':' + str(m_time) + ':' + str(s_time) + '.' + str(ms_time/100000))

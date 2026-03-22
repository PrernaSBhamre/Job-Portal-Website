import zipfile
import xml.etree.ElementTree as ET

with open('extracted_doc.txt', 'w', encoding='utf-8') as f:
    try:
        zf = zipfile.ZipFile(r'd:\DRUSHYA INTERSHIP WORKS\JobPortal_website\Job-Portal Document.docx')
        tree = ET.fromstring(zf.read('word/document.xml'))
        namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        text = []
        for p in tree.iterfind('.//w:p', namespaces):
            para_text = []
            for r in p.iterfind('.//w:r', namespaces):
                for t in r.iterfind('.//w:t', namespaces):
                    if t.text:
                        para_text.append(t.text)
            text.append(''.join(para_text))
            
        f.write('\n'.join(text))
    except Exception as e:
        f.write(f"Error: {e}")

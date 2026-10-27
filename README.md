# מה מירי אמרה?

## Search and sharing metadata

Edit `seo.json` to update the Hebrew title, summary, public site URL, or social preview image, then run `npm run build`. The build generates canonical, Open Graph, X/Twitter, and JSON-LD metadata in `index.html`, plus `robots.txt` and `sitemap.xml`. Keep the image dimensions and alternative text in sync with the selected image; its URL must be publicly accessible. The current square illustration uses a summary card on X.

The public URL is `https://whatmirisaid.games/`. If the domain changes, update `seo.json` and rebuild. Commit all generated files together. After publishing, submit `https://whatmirisaid.games/sitemap.xml` in Google Search Console; indexing and refreshed social previews depend on the providers crawling the published site.

משחק סטטי המתאים ל־GitHub Pages. אפשר לפתוח את `index.html` ישירות בדפדפן. הקובץ כולל בתוכו את העיצוב, הציטוטים וקוד המשחק ויכול לפעול גם בפני עצמו. להפעלה מקומית עם נגן YouTube מוטמע, מריצים `npm start` ופותחים `http://localhost:8000`. נדרש Node.js, ללא התקנת חבילות.

## עריכת ציטוטים

הציטוטים נמצאים ב־`quotes.json`. סדר השאלות מעורבב בכל משחק חדש. לכל ציטוט יש `quote` (הטקסט) ו־`real` (הערך `true` לציטוט אמיתי או `false` לציטוט מומצא). לציטוט אמיתי יש להוסיף גם `context` להסבר ו־`source` לקישור למקור. אפשר להוסיף או להסיר פריטים; מספר השאלות והניקוד יתעדכנו בהתאם. יש לשמור על תחביר JSON תקין, כולל פסיקים בין הפריטים.

להעלאה ל־GitHub Pages יש להעלות את כל הקבצים למאגר ולהגדיר את Pages לפרסום מענף המאגר ותיקיית השורש.

להוספת סרטון לציטוט, מוסיפים שדה `video` עם קישור YouTube רגיל (למשל `https://www.youtube.com/watch?v=wstiIkc16ug`) או קישור `youtu.be`. הסרטון מופיע רק אחרי בחירת תשובה. אם YouTube חוסם את הנגן בפתיחה מקומית של הקובץ, אפשר להשתמש בקישור "לצפייה ב־YouTube" המופיע מתחתיו.

אפשר לשים בשדה `video` גם קישור לפוסט ב־X או ב־Twitter. בשרת מקומי ובאתר המפורסם יוצג הפוסט המוטמע, עם קישור ישיר לצפייה אם ההטמעה נחסמת. בפתיחה ישירה של HTML מקומי יוצג קישור לצפייה ב־X.

נתמכים גם סרטוני פייסבוק בקישור `https://www.facebook.com/watch/?v=VIDEO_ID`, עם נגן מוטמע באתר וקישור ישיר לצפייה. זמינות הנגן תלויה בהרשאות הסרטון ובהגדרות פייסבוק.

קישורי YouTube Shorts נתמכים גם הם בשדה `video`.

קטע השמע מהכתבה על המלונות מוגדר בשדה `audio` ומופעל בנגן שמע רגיל. סרטון הליכודיאדה משתמש בזרם HLS ציבורי מתוך כתבת ynet; בדפדפנים ללא תמיכה מובנית נטענת ספריית hls.js לפי הצורך. הנגנים מופיעים אחרי התשובה, ואינם מתחילים לנגן אוטומטית. מעבר לשאלה הבאה מפסיק את הניגון. אזור הסרטונים במחשב שומר על גובה קבוע גם בזמן טעינת פוסטים מ־X.

תמונת הרקע נמצאת ב־`assets/miri-transit-pattern.png` ומוטמעת אוטומטית בתוך ה־HTML בעת הבנייה. תיאור היצירה שמור ב־`assets/background-prompt.txt`.

אייקון הלשונית נמצא ב־`assets/miri-favicon.png` וגם הוא מוטמע בתוך ה־HTML, כך שהוא זמין גם בפתיחה מקומית. תיאור היצירה שמור ב־`assets/favicon-prompt.txt`.

לאחר עריכת `quotes.json`, `style.css` או `app.js`, יש להריץ `npm run build` כדי לעדכן את `index.html` העצמאי. גם `npm start` בונה אותו לפני הפעלת השרת. הבנייה אורזת את הקבצים לתוך HTML אחד לצורך פתיחה ישירה; באתר שפורסם ובשרת מקומי המשחק טוען את קובץ ה־JSON העדכני, ואם הוא אינו זמין הוא משתמש בציטוטים הכלולים ב־HTML.

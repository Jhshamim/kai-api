import * as cheerio from 'cheerio';
fetch('https://anikai.to/watch/one-piece-dk6r').then(r => r.text()).then(html => {
  const $ = cheerio.load(html);
  
  const related = [];
  $('#anime-related .item').each((_, el) => related.push($(el).text().trim()));
  
  const recommend = [];
  $('section').each((_, el) => {
     console.log($(el).attr('id'), $(el).attr('class'));
  });

  const sections = $('section').map((_, el) => $(el).attr('id') || $(el).attr('class')).get();
  
  console.log('Sections:', sections);
  console.log('Blocks:', $('.block_area').map((_, el) => $(el).find('.block_area-header').text().trim()).get());

  console.log('Details sidebar:', $('.binfo-info .item').map((_, el) => $(el).text().trim().replace(/\s+/g, ' ')).get());

});

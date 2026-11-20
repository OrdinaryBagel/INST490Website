<?php defined('ABSPATH') || exit; ?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>

   <html>
<head>
</head>
<body>
<div class = "zipdiv">
      <h1>Enter Your Zipcode To Find your Senator</h1>
      <form action="<?php echo esc_url(home_url('/')); ?>" method="get">
    <input type="text" name="ncapa_zip" maxlength="5"
           inputmode="numeric" pattern="\d{5}" required>
    <button type="submit">Find</button>
</form>
   </div>
<h1 id="zipHeading"></h1>
<div id="zipResults"></div>
</body>
</html>


<?php wp_footer(); ?>
</body>
</html>
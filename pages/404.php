<?php
$this->page->title = __('HEADER_404');
$this->page->view = 'DEFAULT_VIEW';
$this->addController('Text', '<p>' . __('PAGE_404') . '</p>');
?>
from django.views.generic import TemplateView
from django.views.decorators.cache import never_cache

from rest_framework.response import Response

import requests

# Serve React Front End SPA
index = never_cache(TemplateView.as_view(template_name='index.html'))


     
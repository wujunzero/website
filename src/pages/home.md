---
layout: base
eleventyComputed:
  permalink: "/"
---
{% assign pubs = collections.publications | sortDesc: "date" %}

{% assign gsDataBaseUrl = "https://raw.githubusercontent.com/" | append: site.repository | append: "/" %}

<div class="outercontainer">
    {% include "includes/nav.html" %}

    <div class="container body">
        <!-- Home Section -->
        <div class="content heading anchor" id="home">
            <div class="img">
                <!-- WebP first (≈3x smaller); JPEG fallback for older browsers. -->
                <picture>
                    <source srcset="{{ siteBase }}/assets/Jun_Wu.webp" type="image/webp">
                    <img class="img_responsive" src="{{ siteBase }}/assets/Jun_Wu.jpg" alt="Jun Wu"
                        width="180" height="256" style="width:180px; height:auto; border-radius:8px;">
                </picture>
            </div>
            <div class="text info">
                <h1>Jun Wu</h1>
                <p></p>
                <div>Lecturer</div>
                <div>School of Computer Science</div>
                <div>Nanjing University of Information Science & Technology, Nanjing, China</div>
                <div>Email:&nbsp;wujunzero@gmail.com; wujun@nuist.edu.cn</div>
                <p>
                    <span>
                        <div itemscope itemtype="https://schema.org/Person">
                            <a itemprop="sameAs" content="https://orcid.org/0000-0002-5239-5126"
                                href="https://orcid.org/0000-0002-5239-5126" target="orcid.widget"
                                rel="me noopener noreferrer" style="vertical-align:top;">
                                <img src="{{ siteBase }}/assets/orcid.webp" style="width:1em;margin-right:.5em;" alt="ORCID iD icon">
                                https://orcid.org/0000-0002-5239-5126
                            </a>
                        </div>
                    </span>
                </p>
                <p>
                    <span>
                        <!-- No `&label=` on this URL: it would override the label in the JSON,
                             which the crawler switches to "citations (S2)" on a degraded run. -->
                        <a href="https://scholar.google.com/citations?user=xhn6R7EAAAAJ">Google Scholar
                            <img style="display:inline-block;"
                                src="https://img.shields.io/endpoint?url={{ gsDataBaseUrl | append: 'google-scholar-stats/gs_data_shieldsio.json' | url_encode }}&amp;logo=Google%20Scholar&amp;labelColor=f6f6f6&amp;color=9cf&amp;style=flat">
                        </a>
                        /
                        <span><a href="https://dblp.org/pid/20/3894-20.html">DBLP</a></span>
                        /
                        <span><a href="https://github.com/wujunzero">Github</a></span>
                        /
                        <span><a href="https://www.semanticscholar.org/author/2146669050">Semantic Scholar</a></span>
                    </span>
                </p>
            </div>
            <div class="text">
                <p>I have broad interest in artificial intelligence and its applications.
                    My research is concerned with the practical resolution of NP-hard problems,
                    including Boolean Satisfiability Problem(SAT),
                    Maximum Satisfiability Problem (MaxSAT),
                    Minimum Vertex Cover Problem (MVC),
                    Maximum Clique Problem (MC) and
                    Graph Coloring Problem (GC).
                    I am particularly interested in the combinatorial problem with the heuristic algorithm and exact
                    algorithm.
                </p>
            </div>
        </div>

        <!-- Educations Section -->
        <div class="content anchor" id="educations">
            <div class="text" style="z-index:1;position:relative">
                <h2 style="margin-bottom:.5em">Educations</h2>
                <ul style="padding-bottom:1em">
                    <li>September 2010 - July 2014: B.Sc in computer science and technology, Jilin University, China
                    </li>
                    <li>September 2015 - July 2017: M.Sc in computer science and technology, Northeast Normal
                        University, China</li>
                    <li>October 2018 - October 2019: Visiting Ph.D. in University of Picardie Jules Verne, France</li>
                    <li>September 2017 - January 2023: Ph.D in information science and technology, Northeast Normal
                        University, China</li>
                </ul>
            </div>
        </div>

        <!-- Teaching Section -->
        <div class="content anchor" id="teaching">
            <div class="text" style="z-index:1;position:relative">
                <h2 style="margin-bottom:.5em">Teaching</h2>
                <ul style="padding-bottom:1em">
                    <li>Algorithm Design and Analysis, Spring 2025</li>
                    <li>Algorithm Design and Analysis, Spring 2024</li>
                    <li>Discrete Mathematics, Spring 2024</li>
                    <li>Block Chain, Fall 2023</li>
                    <li>Randomized Algorithm. Fall 2023</li>
                </ul>
            </div>
        </div>

        <!-- Projects Section -->
        <div class="content anchor" id="projects">
            <div class="text" style="z-index:1;position:relative">
                <h2 style="margin-bottom:.5em">Projects</h2>
                <ul style="padding-bottom:1em">
                    <li>Supported by NSFC under Grant No. 62306149 (2024 - 2026).</li>
                    <li>Supported by the Startup Foundation for Introducing Talent of NUIST (2023 - 2025).</li>
                </ul>
            </div>
        </div>

        <!-- Publications Section -->
        <div class="content anchor" id="publications">
            <div class="text" style="z-index:1;position:relative">
                <h2 style="margin-bottom:0em">Publications</h2>
            </div>
            <br><br>
            <div id="pubs">
                {% assign pubs = collections.publications | sortDesc: "date" %}
                {% for pub in pubs %}
                <div class="publication">
                    <div class="text">
                        <div class="title"><a href="{{ siteBase }}/{{ pub.data.title | slugify }}/">{{ pub.data.title }}</a></div>
                        <div class="authors">
                            {%- assign primary = pub.data.author | strip: "*" -%}
                            {%- for name in pub.data.authors -%}
                            {%- assign clean = name | strip: "*" -%}
                            {%- if clean == primary -%}<span class="author jw">{{ name }}</span>{%- else -%}<span class="author">{{ name }}</span>{%- endif -%}
                            {%- unless forloop.last %}, {% endunless -%}
                            {%- endfor -%}
                        </div>
                        <div>
                            {% if pub.data.venue %}
                            <span class="venue tag"><a href="{{ pub.data.venue_url }}">{{ pub.data.venue }}</a></span>
                            {% endif %}
                            {% if pub.data.paper %}
                            / <span class="venue tag"><a href="{{ pub.data.paper }}">Paper</a></span>
                            {% endif %}
                            {% if pub.data.code %}
                            / <span class="venue tag"><a href="{{ pub.data.code }}">Code</a></span>
                            {% endif %}
                        </div>
                    </div>
                </div>
                {% endfor %}
            </div>
        </div>

    </div>
</div>

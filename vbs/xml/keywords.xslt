<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
                xmlns:File='http://ns.exiftool.org/File/1.0/'
                xmlns:XMP-dc="http://ns.exiftool.org/XMP/XMP-dc/1.0/"
                xmlns:System="http://ns.exiftool.org/File/System/1.0/"
                xmlns:ExifIFD="http://ns.exiftool.org/EXIF/ExifIFD/1.0/"
                xmlns:str="http://exslt.org/strings">
  
  <!-- Parameters passed from PHP -->  
  <xsl:output method="xml" indent="yes"/>
  
  <xsl:template match="rdf:RDF">
    <images>
      <xsl:call-template name="processDescriptions"/>
    </images>
  </xsl:template>
  
  <xsl:template name="processDescriptions">
    <xsl:for-each select="rdf:Description">
      <xsl:sort select="ExifIFD:DateTimeOriginal" order="descending"/>
      <image id="{File:ImageDataHash}" fileName="{System:FileName}" captureDate="{ExifIFD:DateTimeOriginal}">
        <filePath>
          <xsl:value-of select="substring-before(@rdf:about, System:FileName)"/>
        </filePath>
        <title>
          <xsl:value-of select="XMP-dc:Title"/>
        </title>
        <description>
          <xsl:value-of select="XMP-dc:Description"/>
        </description>
        <keywords>
          <xsl:for-each select="XMP-dc:Subject/rdf:Bag/rdf:li">
            <xsl:choose>
              <xsl:when test="position()!=last()">
                <xsl:value-of select="concat(.,', ')"/>
              </xsl:when>
              <xsl:otherwise>
                <xsl:value-of select="."/>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:for-each>
        </keywords>
      </image>
    </xsl:for-each>
  </xsl:template>
</xsl:stylesheet>

<?php

namespace Oro\Bundle\ApiBundle\Tests\Unit\Processor\Shared\JsonApi;

use Oro\Bundle\ApiBundle\Processor\Shared\JsonApi\CheckRequestType;
use Oro\Bundle\ApiBundle\Request\RequestType;
use Oro\Bundle\ApiBundle\Tests\Unit\Processor\GetList\GetListProcessorTestCase;

class CheckRequestTypeTest extends GetListProcessorTestCase
{
    /** @var CheckRequestType */
    private $processor;

    protected function setUp()
    {
        parent::setUp();
        $this->processor = new CheckRequestType();
    }

    public function testRequestTypeAlreadyContainJsonApiAspect()
    {
        $this->context->getRequestType()->add(RequestType::JSON_API);
        $this->processor->process($this->context);
        self::assertEquals(
            [RequestType::REST, RequestType::JSON_API],
            $this->context->getRequestType()->toArray()
        );
    }

    public function testEmptyContentType()
    {
        $this->processor->process($this->context);
        self::assertEquals(
            [RequestType::REST],
            $this->context->getRequestType()->toArray()
        );
    }

    public function testNotJsonApiContentType()
    {
        $this->context->getRequestHeaders()->set('Content-Type', 'text/plain; charset=UTF-8');
        $this->processor->process($this->context);
        self::assertEquals(
            [RequestType::REST],
            $this->context->getRequestType()->toArray()
        );
    }

    public function testJsonApiContentTypeWithoutMediaType()
    {
        $this->context->getRequestHeaders()->set('Content-Type', 'application/vnd.api+json');
        $this->processor->process($this->context);
        self::assertEquals(
            [RequestType::REST, RequestType::JSON_API],
            $this->context->getRequestType()->toArray()
        );
    }

    /**
     * @expectedException \Symfony\Component\HttpKernel\Exception\UnsupportedMediaTypeHttpException
     * @expectedExceptionMessage Request's "Content-Type" header should not contain any media type parameters.
     */
    public function testJsonApiContentTypeWithMediaType()
    {
        $this->context->getRequestHeaders()->set('Content-Type', 'application/vnd.api+json; charset=UTF-8');
        $this->processor->process($this->context);
    }

    public function testJsonApiContentTypeAndJsonApiAccept()
    {
        $this->context->getRequestHeaders()->set('Content-Type', 'application/vnd.api+json');
        $this->context->getRequestHeaders()->set('Accept', 'application/vnd.api+json');
        $this->processor->process($this->context);
        self::assertEquals(
            [RequestType::REST, RequestType::JSON_API],
            $this->context->getRequestType()->toArray()
        );
    }

    public function testJsonApiContentTypeAndSeveralAcceptsIncludingJsonApi()
    {
        $this->context->getRequestHeaders()->set('Content-Type', 'application/vnd.api+json');
        $this->context->getRequestHeaders()->set('Accept', 'text/plain; charset=UTF-8, application/vnd.api+json');
        $this->processor->process($this->context);
        self::assertEquals(
            [RequestType::REST, RequestType::JSON_API],
            $this->context->getRequestType()->toArray()
        );
    }

    // @codingStandardsIgnoreStart
    /**
     * @expectedException \Symfony\Component\HttpKernel\Exception\NotAcceptableHttpException
     * @expectedExceptionMessage Not supported "Accept" header. It contains the JSON:API content type and all instances of that are modified with media type parameters.
     */
    // @codingStandardsIgnoreEnd
    public function testJsonApiContentTypeAndJsonApiAcceptWithMediaType()
    {
        $this->context->getRequestHeaders()->set('Content-Type', 'application/vnd.api+json');
        $this->context->getRequestHeaders()->set('Accept', 'application/vnd.api+json; charset=UTF-8');
        $this->processor->process($this->context);
    }
}
